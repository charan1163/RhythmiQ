// Fetch and render for KK songs from iTunes (Hindi and Telugu)

async function fetchKkSongs() {
    const queries = [
        'KK',
        'K.K.',
        'Krishnakumar Kunnath'
    ];
    const fetches = queries.map(q =>
        fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=song&limit=200&country=IN`)
    );
    const responses = await Promise.all(fetches);
    const allResults = [];
    for (const res of responses) {
        const data = await res.json();
        allResults.push(...data.results);
    }
    // Remove duplicates by trackId
    const uniqueSongs = Array.from(new Map(allResults.map(song => [song.trackId, song])).values());
    return uniqueSongs;
}

let kkCurrentSongIdx = null;
let kkIsPlaying = false;
let kkSongsCache = [];

function isTelugu(song) {
    return (song.primaryGenreName && song.primaryGenreName.toLowerCase().includes('telugu')) ||
           (song.collectionName && song.collectionName.toLowerCase().includes('telugu'));
}

function isEnglish(song) {
    // Exclude if genre is English or track/album name is only English letters (and not marked as Telugu/Hindi)
    return (song.primaryGenreName && song.primaryGenreName.toLowerCase().includes('english')) ||
           (/^[a-zA-Z0-9\s'".,!?-]+$/.test(song.trackName) && 
            !(song.trackName.toLowerCase().includes('telugu') || song.trackName.toLowerCase().includes('hindi')));
}

function renderKkSongs(songs) {
    const list = document.getElementById('kkSongList');
    if (!songs.length) {
        list.innerHTML = '<div>No songs found.</div>';
        return;
    }
    const ul = document.createElement('ul');
    ul.style.listStyle = 'none';
    ul.style.padding = '0';
    ul.style.margin = '0';
    // Filter out English songs
    const filteredSongs = songs.filter(song => !isEnglish(song));
    filteredSongs.forEach((song, idx) => {
        const li = document.createElement('li');
        li.className = 'song-item' + (idx === kkCurrentSongIdx && kkIsPlaying ? ' active' : '');
        li.style.width = '270px';
        const shortTitle = song.trackName.length > 15 ? song.trackName.slice(0, 15) + '…' : song.trackName;
        let playContent = `<svg viewBox=\"0 0 24 24\" width=\"20\" height=\"20\" fill=\"currentColor\"><circle cx=\"12\" cy=\"12\" r=\"12\" fill=\"#1db954\"/><polygon points=\"9,7 19,12 9,17\" fill=\"#fff\"/></svg>`;
        if (idx === kkCurrentSongIdx && kkIsPlaying) {
            playContent = `<div class=\"frequency-bars\">\n                <div class=\"bar\"></div>\n                <div class=\"bar\"></div>\n                <div class=\"bar\"></div>\n                <div class=\"bar\"></div>\n            </div>`;
        }
        // Telugu badge
        const teluguBadge = isTelugu(song) ? '<span style="background:#1db954;color:#fff;padding:2px 8px;border-radius:8px;font-size:11px;margin-left:8px;">Telugu</span>' : '';
        li.innerHTML = `
            <div class=\"play-on-hover\">${playContent}</div>
            <div class=\"song-art\">
                <img src=\"${song.artworkUrl60 || './images/album-placeholder.png'}\" alt=\"\" style=\"width:100%;height:100%;object-fit:cover;border-radius:6px;\" onerror=\"this.style.display='none'\">
            </div>
            <div class=\"song-info\">
                <div class=\"song-title\">${shortTitle} ${teluguBadge}</div>
                <div class=\"song-artist\">${song.artistName}</div>
            </div>
            <div class=\"song-duration\">00:30</div>
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

function setupKkVolumeControl() {
    const volumeSlider = document.getElementById('kkVolumeSlider');
    const muteBtn = document.getElementById('kkMuteBtn');
    const volumeIcon = document.getElementById('kkVolumeIcon');
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
    kkCurrentSongIdx = idx;
    kkIsPlaying = true;
    renderKkSongs(kkSongsCache);
    playPauseBtn.textContent = '⏸';

    wavesurfer.on('ready', () => {
        duration.textContent = formatTime(wavesurfer.getDuration());
        wavesurfer.play();
        const volumeSlider = document.getElementById('kkVolumeSlider');
        if (volumeSlider) { wavesurfer.setVolume(Number(volumeSlider.value)); }
    });
    wavesurfer.on('audioprocess', () => { current.textContent = formatTime(wavesurfer.getCurrentTime()); });
    wavesurfer.on('seek', () => { current.textContent = formatTime(wavesurfer.getCurrentTime()); });
    wavesurfer.on('finish', () => { playPauseBtn.textContent = '▶'; kkIsPlaying = false; renderKkSongs(kkSongsCache); });

    playPauseBtn.onclick = function() {
        if (!wavesurfer) return;
        if (wavesurfer.isPlaying()) {
            wavesurfer.pause();
            playPauseBtn.textContent = '▶';
            kkIsPlaying = false;
        } else {
            wavesurfer.play();
            playPauseBtn.textContent = '⏸';
            kkIsPlaying = true;
        }
        renderKkSongs(kkSongsCache);
    };
    setupKkVolumeControl();
}

fetchKkSongs().then(songs => { kkSongsCache = songs; renderKkSongs(songs); }); 