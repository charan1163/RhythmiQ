// Sample Telugu and Hindi podcast data with working audio URLs
const samplePodcasts = [
    {
        title: "Chaganti Garu Podcast",
        host: "Chaganti Koteswara Rao",
        category: "Spiritual",
        language: "Telugu",
        artwork: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/mza_1234567890123456789.jpg/100x100bb.jpg",
        previewUrl: "./songs/AGaali Vaaluga.mp3"
    },
    {
        title: "Garikapati Narasimha Rao",
        host: "Garikapati Narasimha Rao",
        category: "Spiritual",
        language: "Telugu",
        artwork: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/mza_1234567890123456789.jpg/100x100bb.jpg",
        previewUrl: "./songs/AMAV.mp3"
    },
    {
        title: "Sadhguru Podcast",
        host: "Sadhguru",
        category: "Spiritual",
        language: "Hindi",
        artwork: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/mza_1234567890123456789.jpg/100x100bb.jpg",
        previewUrl: "./songs/Drama Mine.mp3"
    },
    {
        title: "Sri Sri Ravi Shankar",
        host: "Sri Sri Ravi Shankar",
        category: "Spiritual",
        language: "Hindi",
        artwork: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/mza_1234567890123456789.jpg/100x100bb.jpg",
        previewUrl: "./songs/Honeypie.mp3"
    },
    {
        title: "Telugu Tech Podcast",
        host: "Tech Telugu",
        category: "Technology",
        language: "Telugu",
        artwork: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/mza_1234567890123456789.jpg/100x100bb.jpg",
        previewUrl: "./songs/Husn.mp3"
    },
    {
        title: "Hindi Business Podcast",
        host: "Business Hindi",
        category: "Business",
        language: "Hindi",
        artwork: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/mza_1234567890123456789.jpg/100x100bb.jpg",
        previewUrl: "./songs/Jo Tum Mere Ho.mp3"
    },
    {
        title: "Telugu Stories",
        host: "Telugu Kathalu",
        category: "Stories",
        language: "Telugu",
        artwork: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/mza_1234567890123456789.jpg/100x100bb.jpg",
        previewUrl: "./songs/Kanulanu Thaake.mp3"
    },
    {
        title: "Hindi News Podcast",
        host: "News Hindi",
        category: "News",
        language: "Hindi",
        artwork: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/mza_1234567890123456789.jpg/100x100bb.jpg",
        previewUrl: "./songs/Kun Faaya Kun.mp3"
    },
    {
        title: "Telugu Health Tips",
        host: "Health Telugu",
        category: "Health",
        language: "Telugu",
        artwork: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/mza_1234567890123456789.jpg/100x100bb.jpg",
        previewUrl: "./songs/Metamorphosis.mp3"
    },
    {
        title: "Hindi Motivation",
        host: "Motivation Hindi",
        category: "Motivation",
        language: "Hindi",
        artwork: "https://is1-ssl.mzstatic.com/image/thumb/Podcasts126/v4/2d/2e/2e/2d2e2e2e-2e2e-2e2e-2e2e-2e2e2e2e2e2e/mza_1234567890123456789.jpg/100x100bb.jpg",
        previewUrl: "./songs/Neon Blade Mp3.mp3"
    }
];

async function fetchPodcasts() {
    try {
        // Try to fetch Telugu and Hindi podcasts from iTunes API
        const teluguUrl = `https://itunes.apple.com/search?term=telugu+podcast&entity=podcast&limit=10&country=IN`;
        const hindiUrl = `https://itunes.apple.com/search?term=hindi+podcast&entity=podcast&limit=10&country=IN`;
        const spiritualUrl = `https://itunes.apple.com/search?term=spiritual+podcast&entity=podcast&limit=10&country=IN`;
        
        const [teluguRes, hindiRes, spiritualRes] = await Promise.all([
            fetch(teluguUrl),
            fetch(hindiUrl),
            fetch(spiritualUrl)
        ]);
        
        const teluguData = await teluguRes.json();
        const hindiData = await hindiRes.json();
        const spiritualData = await spiritualRes.json();
        
        // Combine all results and remove duplicates
        const allPodcasts = [...teluguData.results, ...hindiData.results, ...spiritualData.results];
        const uniquePodcasts = Array.from(new Map(allPodcasts.map(podcast => [podcast.collectionId, podcast])).values());
        
        if (uniquePodcasts.length > 0) {
            return uniquePodcasts.map(podcast => ({
                title: podcast.collectionName || podcast.trackName,
                host: podcast.artistName,
                category: podcast.primaryGenreName || "Podcast",
                language: podcast.collectionName?.toLowerCase().includes('telugu') ? "Telugu" : 
                         podcast.collectionName?.toLowerCase().includes('hindi') ? "Hindi" : "Mixed",
                artwork: podcast.artworkUrl100,
                previewUrl: podcast.feedUrl || ""
            }));
        } else {
            // Fallback to sample data
            return samplePodcasts;
        }
    } catch (error) {
        console.log("Using sample podcast data");
        return samplePodcasts;
    }
}

let podcastCurrentSongIdx = null;
let podcastIsPlaying = false;
let podcastSongsCache = [];
let wavesurfer = null;
let podcastLastVolume = 1;
let podcastIsMuted = false;

function renderPodcasts(podcasts) {
    const list = document.getElementById('podcastList');
    if (!podcasts.length) {
        list.innerHTML = '<div>No podcasts found.</div>';
        return;
    }
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';
    podcasts.forEach((podcast, idx) => {
        const li = document.createElement('li');
        li.className = 'podcast-item' + (idx === podcastCurrentSongIdx && podcastIsPlaying ? ' active' : '');
        li.style.width = '270px';
        const shortTitle = podcast.trackName.length > 15 ? podcast.trackName.slice(0, 15) + '…' : podcast.trackName;
        
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
                ${idx === podcastCurrentSongIdx && podcastIsPlaying ? frequencyBars : ''}
            </div>
            <div class="song-art">
                <img src="${podcast.artworkUrl60 || './images/album-placeholder.png'}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:6px;" onerror="this.style.display='none'">
            </div>
            <div class="song-info">
                <div class="song-title">${shortTitle}</div>
                <div class="song-artist">${podcast.artistName}</div>
            </div>
            <div class="song-duration">00:30</div>
        `;
        li.addEventListener('click', () => playSongWithWaveform(podcast, idx));
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
    const volumeSlider = document.getElementById('podcastVolumeSlider');
    const muteBtn = document.getElementById('podcastMuteBtn');
    const volumeIcon = document.getElementById('podcastVolumeIcon');

    if (volumeSlider) {
        volumeSlider.addEventListener('input', (e) => {
            const volume = parseFloat(e.target.value);
            if (wavesurfer) {
                wavesurfer.setVolume(volume);
            }
            podcastLastVolume = volume;
            podcastIsMuted = volume === 0;
            updateVolumeIcon();
        });
    }

    if (muteBtn) {
        muteBtn.addEventListener('click', () => {
            if (podcastIsMuted) {
                // Unmute
                if (wavesurfer) {
                    wavesurfer.setVolume(podcastLastVolume);
                }
                if (volumeSlider) {
                    volumeSlider.value = podcastLastVolume;
                }
                podcastIsMuted = false;
            } else {
                // Mute
                if (wavesurfer) {
                    wavesurfer.setVolume(0);
                }
                if (volumeSlider) {
                    volumeSlider.value = 0;
                }
                podcastIsMuted = true;
            }
            updateVolumeIcon();
        });
    }
}

function updateVolumeIcon() {
    const volumeIcon = document.getElementById('podcastVolumeIcon');
    if (!volumeIcon) return;

    if (podcastIsMuted || podcastLastVolume === 0) {
        volumeIcon.innerHTML = `
            <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#1db954"/>
            <line x1="21" y1="3" x2="3" y2="21" stroke="#1db954" stroke-width="2"/>
        `;
    } else if (podcastLastVolume < 0.5) {
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

function playPodcastWithWaveform(podcast, idx) {
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
            <div class="podcast-volume-row">
                <button id="podcastMuteBtn" class="volume-icon-btn" style="background: none; border: none; display: flex; align-items: center; justify-content: center;">
                    <svg id="podcastVolumeIcon" viewBox="0 0 24 24" width="28" height="28" fill="none" style="transition: all 0.2s;">
                        <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#1db954"/>
                        <path d="M16.5 12c0-1.77-1-3.29-2.5-4.03v8.06A4.978 4.978 0 0016.5 12z" fill="#1db954"/>
                        <path d="M19.5 12c0-3.04-1.64-5.64-4.5-6.32v2.06c1.77.77 3 2.53 3 4.26s-1.23 3.49-3 4.26v2.06c2.86-.68 4.5-3.28 4.5-6.32z" fill="#1db954"/>
                    </svg>
                </button>
                <div class="volume-slider-container">
                    <input type="range" id="podcastVolumeSlider" min="0" max="1" step="0.01" value="1">
                </div>
            </div>
        `;
        document.querySelector('.podcasts-section').appendChild(container);
        setupVolumeControls();
    }
    container.style.display = 'flex';
    document.getElementById('waveformTitle').textContent = podcast.title;
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
    
    // Use preview URL if available, otherwise show message
    if (podcast.previewUrl) {
        wavesurfer.load(podcast.previewUrl);
    } else {
        // Show placeholder for podcasts without preview
        container.innerHTML = `
            <div class="waveform-title">${podcast.title}</div>
            <div style="text-align: center; padding: 40px; color: #b3b3b3;">
                <p>🎧 Podcast Preview Not Available</p>
                <p style="font-size: 0.9em; margin-top: 10px;">This podcast doesn't have a preview available.</p>
            </div>
        `;
        return;
    }
    
    podcastCurrentSongIdx = idx;
    podcastIsPlaying = true;
    renderPodcasts(podcastSongsCache);
    playPauseBtn.textContent = '⏸';

    wavesurfer.on('ready', () => {
        duration.textContent = formatTime(wavesurfer.getDuration());
        wavesurfer.play();
        // Set initial volume
        if (podcastIsMuted) {
            wavesurfer.setVolume(0);
        } else {
            wavesurfer.setVolume(podcastLastVolume);
        }
    });
    wavesurfer.on('audioprocess', () => { 
        current.textContent = formatTime(wavesurfer.getCurrentTime());
    });
    wavesurfer.on('seek', () => { 
        current.textContent = formatTime(wavesurfer.getCurrentTime());
    });
    wavesurfer.on('finish', () => { 
        playPauseBtn.textContent = '▶'; 
        podcastIsPlaying = false; 
        renderPodcasts(podcastSongsCache);
    });

    playPauseBtn.onclick = function() {
        if (!wavesurfer) return;
        if (wavesurfer.isPlaying()) {
            wavesurfer.pause();
            playPauseBtn.textContent = '▶';
            podcastIsPlaying = false;
        } else {
            wavesurfer.play();
            playPauseBtn.textContent = '⏸';
            podcastIsPlaying = true;
        }
        renderPodcasts(podcastSongsCache);
    };
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        fetchPodcasts().then(podcasts => { podcastSongsCache = podcasts; renderPodcasts(podcasts); });
        setupVolumeControls();
    });
} else {
    fetchPodcasts().then(podcasts => { podcastSongsCache = podcasts; renderPodcasts(podcasts); });
    setupVolumeControls();
} 