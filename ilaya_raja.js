// Fetch and render Ilaiyaraaja songs from iTunes

async function fetchIlaiyaraajaSongs() {
    // Fetch Hindi and Tamil songs (Ilaiyaraaja is most known for Tamil, but also did Hindi)
    const tamilUrl = `https://itunes.apple.com/search?term=Ilaiyaraaja&entity=song&limit=100&country=IN&lang=ta`;
    const hindiUrl = `https://itunes.apple.com/search?term=Ilaiyaraaja&entity=song&limit=50&country=IN&lang=hi`;
    const [tamilRes, hindiRes] = await Promise.all([
        fetch(tamilUrl),
        fetch(hindiUrl)
    ]);
    const tamilData = await tamilRes.json();
    const hindiData = await hindiRes.json();
    // Remove duplicates by trackId
    const allSongs = [...tamilData.results, ...hindiData.results];
    const uniqueSongs = Array.from(new Map(allSongs.map(song => [song.trackId, song])).values());
    return uniqueSongs;
}

let ilayaCurrentSongIdx = null;
let ilayaIsPlaying = false;
let ilayaSongsCache = [];
let wavesurfer = null;

function renderIlayaRajaSongs(songs) {
    const list = document.getElementById('ilayaRajaSongList');
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
        li.className = 'song-item' + (idx === ilayaCurrentSongIdx && ilayaIsPlaying ? ' active' : '');
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
                ${idx === ilayaCurrentSongIdx && ilayaIsPlaying ? frequencyBars : ''}
            </div>
            <div class="song-art">
                <img src="${song.artworkUrl60 || './images/album-placeholder.png'}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:6px;" onerror="this.style.display='none'">
            </div>
            <div class="song-info">
                <div class="song-title">${shortTitle}</div>
                <div class="song-artist">${song.artistName}</div>
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

function playSongWithWaveform(song, idx) {
    // Create or show waveform container
    let container = document.getElementById('waveformContainer');
    if (!container) {
        container = document.createElement('div');
        container.className = 'waveform-container';
        container.id = 'waveformContainer';
        container.innerHTML = `
            <div class=\"waveform-title\" id=\"waveformTitle\"></div>
            <div class=\"waveform\" id=\"waveform\"></div>
            <div class=\"waveform-controls\">
                <button id=\"waveformPlayPause\">▶</button>
                <span id=\"waveformCurrent\">00:00</span> / <span id=\"waveformDuration\">00:00</span>
            </div>
        `;
        document.querySelector('.songs-section').appendChild(container);
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
    ilayaCurrentSongIdx = idx;
    ilayaIsPlaying = true;
    renderIlayaRajaSongs(ilayaSongsCache);
    playPauseBtn.textContent = '⏸';

    wavesurfer.on('ready', () => {
        duration.textContent = formatTime(wavesurfer.getDuration());
        wavesurfer.play();
    });
    wavesurfer.on('audioprocess', () => { current.textContent = formatTime(wavesurfer.getCurrentTime()); });
    wavesurfer.on('seek', () => { current.textContent = formatTime(wavesurfer.getCurrentTime()); });
    wavesurfer.on('finish', () => { playPauseBtn.textContent = '▶'; ilayaIsPlaying = false; renderIlayaRajaSongs(ilayaSongsCache); });

    playPauseBtn.onclick = function() {
        if (!wavesurfer) return;
        if (wavesurfer.isPlaying()) {
            wavesurfer.pause();
            playPauseBtn.textContent = '▶';
            ilayaIsPlaying = false;
        } else {
            wavesurfer.play();
            playPauseBtn.textContent = '⏸';
            ilayaIsPlaying = true;
        }
        renderIlayaRajaSongs(ilayaSongsCache);
    };
}

document.addEventListener('DOMContentLoaded', () => {
    fetchIlaiyaraajaSongs().then(songs => { ilayaSongsCache = songs; renderIlayaRajaSongs(songs); });
}); 