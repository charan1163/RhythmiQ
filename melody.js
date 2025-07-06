// Manually curated list of Telugu and Hindi melody songs with artwork and preview URLs
const melodySongs = [
  {
    title: "Vintunnava",
    movie: "Ye Maaya Chesave",
    language: "Telugu",
    artist: "Karthik",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/cover.jpg/100x100bb.jpg",
    previewUrl: "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview115/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/mzaf_1234567890123456789.plus.aac.p.m4a"
  },
  {
    title: "Pranam",
    movie: "Sye",
    language: "Telugu",
    artist: "KK",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/cover.jpg/100x100bb.jpg",
    previewUrl: ""
  },
  {
    title: "Tum Hi Ho",
    movie: "Aashiqui 2",
    language: "Hindi",
    artist: "Arijit Singh",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/cover.jpg/100x100bb.jpg",
    previewUrl: ""
  },
  {
    title: "Tera Ban Jaunga",
    movie: "Kabir Singh",
    language: "Hindi",
    artist: "Akhil Sachdeva, Tulsi Kumar",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/cover.jpg/100x100bb.jpg",
    previewUrl: ""
  },
  {
    title: "Samajavaragamana",
    movie: "Ala Vaikunthapurramuloo",
    language: "Telugu",
    artist: "Sid Sriram",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/cover.jpg/100x100bb.jpg",
    previewUrl: ""
  },
  {
    title: "Agar Tum Saath Ho",
    movie: "Tamasha",
    language: "Hindi",
    artist: "Alka Yagnik, Arijit Singh",
    artwork: "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/cover.jpg/100x100bb.jpg",
    previewUrl: ""
  },
  // Add more songs as needed
];

async function fetchMelodySongs() {
    // Fetch Telugu and Hindi melody songs from iTunes
    const teluguUrl = `https://itunes.apple.com/search?term=melody+telugu&entity=song&limit=25&country=IN`;
    const hindiUrl = `https://itunes.apple.com/search?term=melody+hindi&entity=song&limit=25&country=IN`;
    const [teluguRes, hindiRes] = await Promise.all([
        fetch(teluguUrl),
        fetch(hindiUrl)
    ]);
    const teluguData = await teluguRes.json();
    const hindiData = await hindiRes.json();
    // Remove duplicates by trackId
    const allSongs = [...teluguData.results, ...hindiData.results];
    const uniqueSongs = Array.from(new Map(allSongs.map(song => [song.trackId, song])).values());
    return uniqueSongs;
}

let melodyCurrentSongIdx = null;
let melodyIsPlaying = false;
let melodySongsCache = [];
let wavesurfer = null;
let melodyLastVolume = 1;
let melodyIsMuted = false;
let animationPhase = 'idle'; // 'idle', 'shooting', 'forming', 'planet', 'bursting'
let songDuration = 0;
let currentTime = 0;
let symbolLaunchInterval = null;

// Generate Twinkling Stars for Permanent Background
function generateTwinklingStars() {
    const starsContainer = document.getElementById('twinklingStars');
    if (!starsContainer) return;
    
    const numberOfStars = 25; // Generate 25 stars
    
    for (let i = 0; i < numberOfStars; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        
        // Random position
        const top = Math.random() * 100;
        const left = Math.random() * 100;
        
        // Random size class
        const sizeClasses = ['small', 'medium', 'large'];
        const sizeClass = sizeClasses[Math.floor(Math.random() * sizeClasses.length)];
        star.classList.add(sizeClass);
        
        // Random animation delay
        const delay = Math.random() * 3;
        
        star.style.top = `${top}%`;
        star.style.left = `${left}%`;
        star.style.animationDelay = `${delay}s`;
        
        starsContainer.appendChild(star);
    }
}

// Outer Space Music Animation Functions
function resetAllSymbols() {
    const container = document.getElementById('musicSymbolsContainer');
    if (container) {
        const symbols = container.querySelectorAll('.music-symbol');
        symbols.forEach(symbol => {
            // Reset all CSS properties
            symbol.className = 'music-symbol';
            symbol.style.animation = 'none';
            symbol.style.animationDelay = '';
            symbol.style.opacity = '0';
            symbol.style.transform = 'translateX(-100px) translateY(50vh)';
            symbol.style.setProperty('--final-x', '');
            symbol.style.setProperty('--final-y', '');
            symbol.style.setProperty('--burst-x', '');
            symbol.style.setProperty('--burst-y', '');
            
            // Force reflow to ensure reset
            symbol.offsetHeight;
        });
    }
}

function startOuterSpaceAnimation() {
    const container = document.getElementById('musicSymbolsContainer');
    if (container) {
        // First, reset all symbols to initial state
        resetAllSymbols();
        
        container.style.display = 'block';
        animationPhase = 'shooting';
        
        // Launch symbols one by one from different directions
        const symbols = container.querySelectorAll('.music-symbol');
        let symbolIndex = 0;
        
        // Clear any existing interval
        if (symbolLaunchInterval) {
            clearInterval(symbolLaunchInterval);
        }
        
        symbolLaunchInterval = setInterval(() => {
            if (symbolIndex < symbols.length) {
                const symbol = symbols[symbolIndex];
                const direction = (symbolIndex % 8) + 1; // 8 different directions
                
                // Reset the symbol first
                symbol.style.animation = 'none';
                symbol.style.opacity = '0';
                symbol.offsetHeight; // Force reflow
                
                // Apply new animation with proper timing
                setTimeout(() => {
                    symbol.className = `music-symbol shooting-star-${direction}`;
                    symbol.style.animationDelay = '0s';
                    symbol.style.opacity = '1';
                }, 50); // Small delay to ensure reset is complete
                
                symbolIndex++;
            } else {
                clearInterval(symbolLaunchInterval);
                symbolLaunchInterval = null;
                // Schedule planet formation after all symbols are launched
                setTimeout(() => {
                    startPlanetFormation();
                }, 3000); // Wait 3s after last symbol
            }
        }, 300); // Launch every 300ms
    }
}

function startPlanetFormation() {
    animationPhase = 'forming';
    const container = document.getElementById('musicSymbolsContainer');
    const symbols = container.querySelectorAll('.music-symbol');
    const planet = document.getElementById('planet');
    
    // Calculate final positions for planet formation
    symbols.forEach((symbol, index) => {
        const angle = (index / symbols.length) * 2 * Math.PI;
        const radius = 50;
        const finalX = Math.cos(angle) * radius;
        const finalY = Math.sin(angle) * radius;
        
        // Reset animation first
        symbol.style.animation = 'none';
        symbol.offsetHeight; // Force reflow
        
        symbol.style.setProperty('--final-x', `${finalX}px`);
        symbol.style.setProperty('--final-y', `${finalY}px`);
        symbol.className = 'music-symbol forming-planet';
        symbol.style.animationDelay = `${index * 0.05}s`;
    });
    
    // Show planet after formation
    setTimeout(() => {
        animationPhase = 'planet';
        planet.style.opacity = '1';
        planet.style.transform = 'translate(-50%, -50%) scale(1)';
        planet.style.setProperty('--growth-scale', '1');
    }, symbols.length * 50 + 1500);
}

function updatePlanetGrowth(progress) {
    if (animationPhase === 'planet') {
        const planet = document.getElementById('planet');
        if (planet) {
            // Planet grows from 1x to 3x size as song progresses
            const growthScale = 1 + (progress * 2); // 1x to 3x
            planet.style.setProperty('--growth-scale', growthScale);
            planet.classList.add('growing');
            
            // Remove the class after animation to allow re-triggering
            setTimeout(() => {
                planet.classList.remove('growing');
            }, 500);
        }
    }
}

function startPlanetBurst() {
    animationPhase = 'bursting';
    const container = document.getElementById('musicSymbolsContainer');
    const symbols = container.querySelectorAll('.music-symbol');
    const planet = document.getElementById('planet');
    
    // Hide planet
    planet.style.opacity = '0';
    
    // Burst symbols in different directions with more force
    symbols.forEach((symbol, index) => {
        const angle = (index / symbols.length) * 2 * Math.PI;
        const distance = 150 + Math.random() * 200; // More force (150-350px)
        const burstX = Math.cos(angle) * distance;
        const burstY = Math.sin(angle) * distance;
        
        // Reset animation first
        symbol.style.animation = 'none';
        symbol.offsetHeight; // Force reflow
        
        symbol.style.setProperty('--burst-x', `${burstX}px`);
        symbol.style.setProperty('--burst-y', `${burstY}px`);
        symbol.className = 'music-symbol bursting';
        symbol.style.animationDelay = `${index * 0.03}s`; // Faster burst
    });
    
    // Hide container after burst
    setTimeout(() => {
        stopOuterSpaceAnimation();
    }, 2500);
}

function stopOuterSpaceAnimation() {
    const container = document.getElementById('musicSymbolsContainer');
    if (container) {
        container.style.display = 'none';
        animationPhase = 'idle';
        
        // Clear any ongoing intervals
        if (symbolLaunchInterval) {
            clearInterval(symbolLaunchInterval);
            symbolLaunchInterval = null;
        }
        
        // Reset all symbols completely
        resetAllSymbols();
        
        // Hide planet
        const planet = document.getElementById('planet');
        planet.style.opacity = '0';
        planet.style.transform = 'translate(-50%, -50%) scale(1)';
        planet.style.setProperty('--growth-scale', '1');
        planet.classList.remove('growing');
    }
}

function updateAnimationProgress(currentTime, duration) {
    if (duration > 0) {
        const progress = currentTime / duration;
        
        if (animationPhase === 'planet') {
            // Update planet growth based on song progress
            updatePlanetGrowth(progress);
            
            // Start burst animation when song is 95% complete
            if (progress >= 0.95 && animationPhase === 'planet') {
                startPlanetBurst();
            }
        }
    }
}

function renderMelodySongs(songs) {
    const list = document.getElementById('melodySongList');
    if (!songs.length) {
        list.innerHTML = '<div>No songs found.</div>';
        return;
    }
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';
    songs.forEach((song, idx) => {
        const li = document.createElement('li');
        li.className = 'song-item' + (idx === melodyCurrentSongIdx && melodyIsPlaying ? ' active' : '');
        li.style.width = '270px';
        const shortTitle = song.trackName.length > 15 ? song.trackName.slice(0, 15) + '…' : song.trackName;
        
        // Create play button and frequency bars structure
        const playButton = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="12" cy="12" r="12" fill="#1db954"/><polygon points="9,7 19,12 9,17" fill="#fff"/></svg>`;
        const frequencyBars = `<div class="frequency-bars">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
        </div>`;
        
        li.innerHTML = `
            <div class="play-on-hover">
                <div class="play-button">${playButton}</div>
                ${idx === melodyCurrentSongIdx && melodyIsPlaying ? frequencyBars : ''}
            </div>
            <div class="song-art">
                <img src="${song.artworkUrl60 || './images/album-placeholder.png'}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:6px;" onerror="this.style.display='none'">
            </div>
            <div class="song-info">
                <div class="song-title">${shortTitle} <span style="background:#1db954;color:#fff;padding:2px 8px;border-radius:8px;font-size:11px;margin-left:8px;">${song.primaryGenreName || ''}</span></div>
                <div class="song-artist">${song.artistName} | ${song.collectionName}</div>
            </div>
            <div class="song-duration">00:30</div>
        `;
        li.addEventListener('click', () => playSongWithWaveform(song, idx));
        ul.appendChild(li);
    });
    list.innerHTML = '';
    list.appendChild(ul);
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function setupVolumeControls() {
    const volumeSlider = document.getElementById('melodyVolumeSlider');
    const muteBtn = document.getElementById('melodyMuteBtn');
    const volumeIcon = document.getElementById('melodyVolumeIcon');

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            if (wavesurfer) {
                wavesurfer.setVolume(volume);
            }
            melodyLastVolume = volume;
            melodyIsMuted = volume === 0;
            updateVolumeIcon();
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (melodyIsMuted) {
                // Unmute
                if (wavesurfer) {
                    wavesurfer.setVolume(melodyLastVolume);
                }
                if (volumeSlider) {
                    volumeSlider.value = melodyLastVolume;
                }
                melodyIsMuted = false;
            } else {
                // Mute
                if (wavesurfer) {
                    wavesurfer.setVolume(0);
                }
                if (volumeSlider) {
                    volumeSlider.value = 0;
                }
                melodyIsMuted = true;
            }
            updateVolumeIcon();
        });
    }
}

function updateVolumeIcon() {
    const volumeIcon = document.getElementById('melodyVolumeIcon');
    if (!volumeIcon) return;

    if (melodyIsMuted || melodyLastVolume === 0) {
        volumeIcon.innerHTML = `
            <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#1db954"/>
            <line x1="21" y1="3" x2="3" y2="21" stroke="#1db954" stroke-width="2"/>
        `;
    } else if (melodyLastVolume < 0.5) {
        volumeIcon.innerHTML = `
            <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#1db954"/>
            <path d="M16.5 12c0-1.77-1-3.29-2.5-4.03v8.06A4.978 4.978 0 0016.5 12z" fill="#1db954"/>
        `;
    } else {
        volumeIcon.innerHTML = `
            <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#1db954"/>
            <path d="M16.5 12c0-1.77-1-3.29-2.5-4.03v8.06A4.978 4.978 0 0016.5 12z" fill="#1db954"/>
            <path d="M19.5 12c0-3.04-1.64-5.64-4.5-6.32v2.06c1.77.77 3 2.53 3 4.26s-1.23 3.49-3 4.26v2.06c2.86-.68 4.5-3.28 4.5-6.32z" fill="#1db954"/>
        `;
    }
}

function playSongWithWaveform(song, idx) {
    let container = document.getElementById('waveformContainer');
    if (!container) {
        container = document.createElement('div');
        container.className = 'waveform-container';
        container.id = 'waveformContainer';
        container.innerHTML = `
            <div class="waveform-title" id="waveformTitle"></div>
            <div class="waveform" id="waveform"></div>
            <div class="waveform-controls">
                <button id="waveformPlayPause">▶</button>
                <span id="waveformCurrent">00:00</span> / <span id="waveformDuration">00:00</span>
            </div>
            <div class="melody-volume-row">
                <button id="melodyMuteBtn" class="volume-icon-btn" style="background: none; border: none; display: flex; align-items: center; justify-content: center;">
                    <svg id="melodyVolumeIcon" viewBox="0 0 24 24" width="28" height="28" fill="none" style="transition: all 0.2s;">
                        <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#1db954"/>
                        <path d="M16.5 12c0-1.77-1-3.29-2.5-4.03v8.06A4.978 4.978 0 0016.5 12z" fill="#1db954"/>
                        <path d="M19.5 12c0-3.04-1.64-5.64-4.5-6.32v2.06c1.77.77 3 2.53 3 4.26s-1.23 3.49-3 4.26v2.06c2.86-.68 4.5-3.28 4.5-6.32z" fill="#1db954"/>
                    </svg>
                </button>
                <div class="volume-slider-container">
                    <input type="range" id="melodyVolumeSlider" min="0" max="1" step="0.01" value="1">
                </div>
            </div>
        `;
        document.querySelector('.songs-section').appendChild(container);
        setupVolumeControls();
    }
    container.style.display = 'flex';
    document.getElementById('waveformTitle').textContent = song.trackName;
    const playPauseBtn = document.getElementById('waveformPlayPause');
    const current = document.getElementById('waveformCurrent');
    const duration = document.getElementById('waveformDuration');

    if (wavesurfer) { wavesurfer.destroy(); }
    wavesurfer = WaveSurfer.create({
        container: '#waveform',
        waveColor: '#1db954',
        progressColor: '#fff',
        height: 80,
        barWidth: 2,
        barGap: 2,
        cursorColor: '#1db954',
        backgroundColor: 'rgba(0,0,0,0)',
    });
    wavesurfer.load(song.previewUrl);
    melodyCurrentSongIdx = idx;
    melodyIsPlaying = true;
    renderMelodySongs(melodySongsCache);
    playPauseBtn.textContent = '⏸';

    // Start the outer space animation
    startOuterSpaceAnimation();

    wavesurfer.on('ready', () => {
        songDuration = wavesurfer.getDuration();
        duration.textContent = formatTime(songDuration);
        wavesurfer.play();
        // Set initial volume
        if (melodyIsMuted) {
            wavesurfer.setVolume(0);
        } else {
            wavesurfer.setVolume(melodyLastVolume);
        }
    });
    wavesurfer.on('audioprocess', () => { 
        currentTime = wavesurfer.getCurrentTime();
        current.textContent = formatTime(currentTime);
        updateAnimationProgress(currentTime, songDuration);
    });
    wavesurfer.on('seek', () => { 
        currentTime = wavesurfer.getCurrentTime();
        current.textContent = formatTime(currentTime);
        updateAnimationProgress(currentTime, songDuration);
    });
    wavesurfer.on('finish', () => { 
        playPauseBtn.textContent = '▶'; 
        melodyIsPlaying = false; 
        renderMelodySongs(melodySongsCache);
        // Stop the outer space animation
        stopOuterSpaceAnimation();
    });

    playPauseBtn.onclick = function() {
        if (!wavesurfer) return;
        if (wavesurfer.isPlaying()) {
            wavesurfer.pause();
            playPauseBtn.textContent = '▶';
            melodyIsPlaying = false;
            // Stop the outer space animation
            stopOuterSpaceAnimation();
        } else {
            wavesurfer.play();
            playPauseBtn.textContent = '⏸';
            melodyIsPlaying = true;
            // Start the outer space animation
            startOuterSpaceAnimation();
        }
        renderMelodySongs(melodySongsCache);
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Generate twinkling stars immediately
        generateTwinklingStars();
        
        fetchMelodySongs().then(songs => { melodySongsCache = songs; renderMelodySongs(songs); });
        setupVolumeControls();
    });
} else {
    // Generate twinkling stars immediately
    generateTwinklingStars();
    
    fetchMelodySongs().then(songs => { melodySongsCache = songs; renderMelodySongs(songs); });
    setupVolumeControls();
} 