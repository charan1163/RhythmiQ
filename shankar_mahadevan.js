// Fetch and render for Shankar Mahadevan songs from iTunes

async function fetchShankarSongs() {
    const url = `https://itunes.apple.com/search?term=Shankar+Mahadevan&entity=song&limit=12`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
}

let shankarCurrentSongIdx = null;
let shankarIsPlaying = false;
let shankarSongsCache = [];

function renderShankarSongs(songs) {
    const list = document.getElementById('shankarSongList');
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
        li.className = 'song-item' + (idx === shankarCurrentSongIdx && shankarIsPlaying ? ' active' : '');
        li.style.width = '270px';
        const shortTitle = song.trackName.length > 15 ? song.trackName.slice(0, 15) + '…' : song.trackName;
        let playContent = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="12" cy="12" r="12" fill="#1db954"/><polygon points="9,7 19,12 9,17" fill="#fff"/></svg>`;
        if (idx === shankarCurrentSongIdx && shankarIsPlaying) {
            playContent = `<div class="frequency-bars">
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
                <div class="bar"></div>
            </div>`;
        }
        li.innerHTML = `
            <div class="play-on-hover">${playContent}</div>
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

let wavesurfer = null;
let currentSongIdx = null;
let currentPreviewUrl = null;
let isPlaying = false;

function formatTime(seconds) {
    if (isNaN(seconds)) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function setupShankarVolumeControl() {
    const volumeSlider = document.getElementById('shankarVolumeSlider');
    const muteBtn = document.getElementById('shankarMuteBtn');
    const volumeIcon = document.getElementById('shankarVolumeIcon');
    let isMuted = false;
    let lastVolume = 1;
    if (!volumeSlider || !muteBtn || !volumeIcon) return;
    volumeSlider.addEventListener('input', function() {
        if (wavesurfer) {
            wavesurfer.setVolume(Number(volumeSlider.value));
            if (Number(volumeSlider.value) === 0) {
                isMuted = true;
                volumeIcon.style.opacity = 0.5;
            } else {
                isMuted = false;
                lastVolume = Number(volumeSlider.value);
                volumeIcon.style.opacity = 1;
            }
        }
    });
    muteBtn.addEventListener('click', function() {
        if (!wavesurfer) return;
        if (!isMuted) {
            lastVolume = Number(volumeSlider.value);
            wavesurfer.setVolume(0);
            volumeSlider.value = 0;
            isMuted = true;
            volumeIcon.style.opacity = 0.5;
        } else {
            wavesurfer.setVolume(lastVolume || 1);
            volumeSlider.value = lastVolume || 1;
            isMuted = false;
            volumeIcon.style.opacity = 1;
        }
    });
}

function playSongWithWaveform(song, idx) {
    const container = document.getElementById('waveformContainer');
    const title = document.getElementById('waveformTitle');
    const playPauseBtn = document.getElementById('waveformPlayPause');
    const current = document.getElementById('waveformCurrent');
    const duration = document.getElementById('waveformDuration');
    container.style.display = 'flex';
    title.textContent = song.trackName;

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
    shankarCurrentSongIdx = idx;
    shankarIsPlaying = true;
    renderShankarSongs(shankarSongsCache);
    playPauseBtn.textContent = '⏸';

    wavesurfer.on('ready', () => {
        duration.textContent = formatTime(wavesurfer.getDuration());
        wavesurfer.play();
        const volumeSlider = document.getElementById('shankarVolumeSlider');
        if (volumeSlider) { wavesurfer.setVolume(Number(volumeSlider.value)); }
    });
    wavesurfer.on('audioprocess', () => { current.textContent = formatTime(wavesurfer.getCurrentTime()); });
    wavesurfer.on('seek', () => { current.textContent = formatTime(wavesurfer.getCurrentTime()); });
    wavesurfer.on('finish', () => { playPauseBtn.textContent = '▶'; shankarIsPlaying = false; renderShankarSongs(shankarSongsCache); });

    playPauseBtn.onclick = function() {
        if (!wavesurfer) return;
        if (wavesurfer.isPlaying()) {
            wavesurfer.pause();
            playPauseBtn.textContent = '▶';
            shankarIsPlaying = false;
        } else {
            wavesurfer.play();
            playPauseBtn.textContent = '⏸';
            shankarIsPlaying = true;
        }
        renderShankarSongs(shankarSongsCache);
    };
    setupShankarVolumeControl();
}

fetchShankarSongs().then(songs => { shankarSongsCache = songs; renderShankarSongs(songs); }); 