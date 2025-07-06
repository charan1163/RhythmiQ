// Get artist name from URL
function getArtistFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('artist') || '';
}

async function fetchSongsByArtist(artist) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=song&limit=10`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
}

function renderSongs(songs) {
    const list = document.getElementById('artistSongList');
    if (!songs.length) {
        list.innerHTML = '<li>No songs found.</li>';
        return;
    }
    list.innerHTML = '';
    songs.forEach(song => {
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.alignItems = 'center';
        li.style.gap = '16px';
        li.innerHTML = `
            <button class="play-preview" title="Play Preview">▶</button>
            <img src="${song.artworkUrl60}" alt="cover" style="width:40px;height:40px;border-radius:6px;object-fit:cover;">
            <div style="flex:1;">
                <div style="font-weight:600;">${song.trackName}</div>
                <div style="font-size:13px;color:#b3b3b3;">${song.artistName}</div>
            </div>
        `;
        // Play preview logic
        const playBtn = li.querySelector('.play-preview');
        let audio = null;
        playBtn.addEventListener('click', function() {
            // Stop any other previews
            document.querySelectorAll('.play-preview').forEach(btn => {
                if (btn !== playBtn && btn.audio) {
                    btn.audio.pause();
                    btn.audio.currentTime = 0;
                    btn.textContent = '▶';
                }
            });
            if (!audio) {
                audio = new Audio(song.previewUrl);
                playBtn.audio = audio;
            }
            if (audio.paused) {
                audio.play();
                playBtn.textContent = '⏸';
            } else {
                audio.pause();
                playBtn.textContent = '▶';
            }
            audio.onended = () => {
                playBtn.textContent = '▶';
            };
        });
        list.appendChild(li);
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    const artist = getArtistFromURL();
    document.getElementById('artistName').textContent = artist ? `Songs by ${artist}` : 'Artist';
    if (artist) {
        document.getElementById('artistSongList').innerHTML = '<li>Loading...</li>';
        const songs = await fetchSongsByArtist(artist);
        renderSongs(songs);
    }
}); 