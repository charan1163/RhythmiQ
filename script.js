console.log("java script working...")
let currentSong=new Audio();
let songs;

// --- Spotify Clone Full Player Logic ---

const audio = document.getElementById('audioPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const playIcon = document.getElementById('playIcon');
const pauseIcon = document.getElementById('pauseIcon');
const nextBtn = document.getElementById('nextBtn');
const prevBtn = document.getElementById('prevBtn');
const seekBar = document.getElementById('seekBar');
const volumeSlider = document.getElementById('volumeSlider');
const muteBtn = document.getElementById('muteBtn');
const volumeIcon = document.getElementById('volumeIcon');
const songTitle = document.getElementById('songTitle');
const songArtist = document.getElementById('songArtist');
const currentTimeEl = document.getElementById('currentTime');
const durationEl = document.getElementById('duration');
const songListUL = document.querySelector('.songList ul');
const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');
let isShuffled = false;
let repeatMode = 0; // 0: no repeat, 1: repeat all, 2: repeat one

// Replace the static playlist with a dynamic one from iTunes API
let playlist = [];
let currentIndex = 0;
let isMuted = false;

// List of your original library songs
const originalLibrary = [
  // Telugu
  { title: 'Butta Bomma', artist: 'Armaan Malik' },
  { title: 'Samajavaragamana', artist: 'Sid Sriram' },
  { title: 'Rowdy Baby', artist: 'Dhanush' },
  // Hindi
  { title: 'Tum Hi Ho', artist: 'Arijit Singh' },
  { title: 'Apna Time Aayega', artist: 'Ranveer Singh' },
  { title: 'Shayad', artist: 'Arijit Singh' },
  // English
  { title: 'Shape of You', artist: 'Ed Sheeran' },
  { title: 'Blinding Lights', artist: 'The Weeknd' },
  { title: 'Levitating', artist: 'Dua Lipa' },
  // Your previous songs
  { title: 'AGaali Vaaluga', artist: 'Anirudh Ravichander' },
  { title: 'Neon Blade', artist: 'Daft Punk' },
  { title: 'Untitled 13', artist: 'Unknown Artist' },
  { title: 'Vaathi-Raid', artist: 'Anirudh Ravichander' },
  { title: 'Jo Tum Mere Ho', artist: 'Arijit Singh' },
  { title: 'Husn', artist: 'Anuv Jain' },
  { title: 'Kanulanu Thaake', artist: 'Sid Sriram' },
  { title: 'Kun Faaya Kun', artist: 'A.R. Rahman' },
  { title: 'Drama Mine', artist: 'Unknown Artist' },
  { title: 'Honeypie', artist: 'JAWNY' },
  // Add Scam 1992 BGM with official iTunes name
  { title: 'Scam 1992 (From "Scam 1992") [Theme Music]', artist: 'Achint' },
];

async function fetchLibrarySongs() {
  console.log('Fetching library songs from iTunes...');
  try {
    // For each song, search iTunes API for a preview
    const results = await Promise.all(originalLibrary.map(async (song) => {
      try {
        const url = `https://itunes.apple.com/search?term=${encodeURIComponent(song.title + ' ' + song.artist)}&entity=song&limit=1`;
        console.log('Fetching:', url);
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('iTunes API result for', song.title, data);
        if (data.results && data.results.length > 0) {
          const found = data.results[0];
          // Only return songs that have a valid preview URL
          if (found.previewUrl) {
            return {
              title: found.trackName,
              artist: found.artistName,
              previewUrl: found.previewUrl,
              artwork: found.artworkUrl60,
              duration: '00:30',
              available: true,
            };
          } else {
            // Skip songs without preview URLs
            return null;
          }
        } else {
          // Skip songs not found in API
          return null;
        }
      } catch (error) {
        console.warn(`Failed to fetch data for ${song.title}:`, error);
        // Skip songs with API errors
        return null;
      }
    }));
    
    // Filter out null results (songs without working previews)
    playlist = results.filter(song => song !== null);
    console.log('Playlist after iTunes fetch:', playlist);
    currentIndex = 0;
    buildPlaylistUI();
    
    // Only load song if we have songs with working previews
    if (playlist.length > 0) {
      loadSong(0, false);
    } else {
      console.log('No songs with working previews found');
    }
  } catch (error) {
    console.error('Failed to fetch library songs:', error);
    // If all API calls fail, set empty playlist
    playlist = [];
    currentIndex = 0;
    buildPlaylistUI();
  }
}

function secondsToMMSS(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds <= 0) return '00:00';
    totalSeconds = Math.floor(totalSeconds);
    let minutes = Math.floor(totalSeconds / 60);
    let seconds = totalSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function loadSong(index, autoplay = false) {
  const song = playlist[index];
  if (!song) return;
  
  audio.src = song.previewUrl;
  // Truncate footer song title to 15 characters
  const shortFooterTitle = song.title.length > 15 ? song.title.slice(0, 15) + '…' : song.title;
  songTitle.textContent = shortFooterTitle;
  songArtist.textContent = song.artist || '';
  currentTimeEl.textContent = '00:00';
  durationEl.textContent = song.duration ? song.duration : '00:00';
  seekBar.value = 0;
  highlightCurrentSong();
  if (autoplay) playSong();
  else updatePlayPauseIcon();
}

function playSong() {
  audio.play();
  updatePlayPauseIcon();
}

function pauseSong() {
  audio.pause();
  updatePlayPauseIcon();
}

function updatePlayPauseIcon() {
  if (audio.paused) {
    playIcon.style.display = '';
    pauseIcon.style.display = 'none';
  } else {
    playIcon.style.display = 'none';
    pauseIcon.style.display = '';
  }
}

function nextSong() {
  currentIndex = (currentIndex + 1) % playlist.length;
  loadSong(currentIndex, true);
  highlightCurrentSong();
}

function prevSong() {
  currentIndex = (currentIndex - 1 + playlist.length) % playlist.length;
  loadSong(currentIndex, true);
  highlightCurrentSong();
}

// Add helpers for mm and ss
function getMinutes(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00';
  return String(Math.floor(totalSeconds / 60)).padStart(2, '0');
}
function getSeconds(totalSeconds) {
  if (isNaN(totalSeconds) || totalSeconds < 0) return '00';
  return String(Math.floor(totalSeconds % 60)).padStart(2, '0');
}

// Update time display on seekbar
const currentMinutesEl = document.getElementById('currentMinutes');
const currentSecondsEl = document.getElementById('currentSeconds');

function updateSeekBar() {
  seekBar.max = audio.duration || 0;
  seekBar.value = audio.currentTime;
  // Show mm at start, ss at end
  currentMinutesEl.textContent = getMinutes(audio.currentTime);
  currentSecondsEl.textContent = getSeconds(audio.currentTime);
  currentTimeEl.textContent = secondsToMMSS(audio.currentTime);
  durationEl.textContent = secondsToMMSS(audio.duration);
}

function seek(e) {
  audio.currentTime = seekBar.value;
}

function setVolume(e) {
  audio.volume = volumeSlider.value;
  if (audio.volume === 0) {
    setVolumeIcon(true);
  } else {
    setVolumeIcon(false);
  }
}

function toggleMute() {
  isMuted = !isMuted;
  audio.muted = isMuted;
  setVolumeIcon(isMuted);
}

function setVolumeIcon(muted) {
  const volumeIcon = document.getElementById('volumeIcon');
  if (!volumeIcon) return;
  if (muted || audio.volume === 0) {
    volumeIcon.innerHTML = `
      <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#1db954"/>
      <line x1="19" y1="5" x2="5" y2="19" stroke="#1db954" stroke-width="2"/>
    `;
  } else {
    volumeIcon.innerHTML = `
      <path d="M3 9v6h4l5 5V4L7 9H3z" fill="#1db954"/>
      <path d="M16.5 12c0-1.77-1-3.29-2.5-4.03v8.06A4.978 4.978 0 0016.5 12z" fill="#1db954"/>
      <path d="M19.5 12c0-3.04-1.64-5.64-4.5-6.32v2.06c1.77.77 3 2.53 3 4.26s-1.23 3.49-3 4.26v2.06c2.86-.68 4.5-3.28 4.5-6.32z" fill="#1db954"/>
    `;
  }
}

function buildPlaylistUI(filteredList) {
  console.log('Building playlist UI...', filteredList || playlist);
  const songList = document.querySelector('.songList ul, .song-list');
  songList.innerHTML = '';
  // Only show songs with working preview URLs
  const list = (filteredList || playlist).filter(song => song.previewUrl);
  list.forEach((song, idx) => {
    const li = document.createElement('li');
    li.style.width = '300px';
    li.className = 'song-item' + (idx === currentIndex ? ' active' : '');
    // Truncate song title to 15 characters
    const shortTitle = song.title.length > 10 ? song.title.slice(0, 10) + '…' : song.title;
    li.innerHTML = `
      <div class="play-on-hover">
        ${idx === currentIndex && !audio.paused ? 
          `<div class="frequency-bars">
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
            <div class="bar"></div>
          </div>` : 
          `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="12" cy="12" r="12" fill="#1db954"/><polygon points="9,7 19,12 9,17" fill="#fff"/></svg>`
        }
      </div>
      <div class="song-art">
        <img src="${song.artwork || './images/album-placeholder.png'}" alt="" style="width:100%;height:100%;object-fit:cover;border-radius:6px;" onerror="this.style.display='none'">
      </div>
      <div class="song-info">
        <div class="song-title">${shortTitle}</div>
        <div class="song-artist">${song.artist ? song.artist : '-'}</div>
      </div>
      <div class="song-duration">${song.duration ? song.duration : '-'}</div>
    `;
    li.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      li.style.backgroundColor = '#282828';
      setTimeout(() => {
        li.style.backgroundColor = '';
      }, 200);
      
      if (currentIndex !== idx) {
        currentIndex = idx;
        loadSong(currentIndex, true);
      } else {
        if (audio.paused) playSong();
        else pauseSong();
      }
    });
    songList.appendChild(li);
  });
}

function highlightCurrentSong() {
  const items = document.querySelectorAll('.song-item');
  items.forEach((li, idx) => {
    const playButton = li.querySelector('.play-on-hover');
    if (idx === currentIndex) {
      li.classList.add('active');
      // Update frequency bars for currently playing song
      if (!audio.paused) {
        playButton.innerHTML = `<div class="frequency-bars">
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
          <div class="bar"></div>
        </div>`;
      } else {
        playButton.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="12" cy="12" r="12" fill="#1db954"/><polygon points="9,7 19,12 9,17" fill="#fff"/></svg>`;
      }
    } else {
      li.classList.remove('active');
      // Reset to play button for non-active songs
      playButton.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><circle cx="12" cy="12" r="12" fill="#1db954"/><polygon points="9,7 19,12 9,17" fill="#fff"/></svg>`;
    }
  });
}

// --- Event Listeners ---
playPauseBtn.addEventListener('click', () => {
  if (audio.paused) {
    playSong();
  } else {
    pauseSong();
  }
  updatePlayPauseIcon();
  highlightCurrentSong();
});
nextBtn.addEventListener('click', nextSong);
prevBtn.addEventListener('click', prevSong);
audio.addEventListener('timeupdate', updateSeekBar);
audio.addEventListener('ended', nextSong);
audio.addEventListener('loadedmetadata', () => {
  // Update duration display when audio metadata is loaded
  if (!isNaN(audio.duration) && audio.duration > 0) {
    durationEl.textContent = secondsToMMSS(audio.duration);
    // Also update the playlist duration if it's not set
    if (!playlist[currentIndex].duration || playlist[currentIndex].duration === 'Loading...') {
      playlist[currentIndex].duration = secondsToMMSS(audio.duration);
      buildPlaylistUI();
    }
  }
});
seekBar.addEventListener('input', seek);
volumeSlider.addEventListener('input', setVolume);
muteBtn.addEventListener('click', toggleMute);
audio.addEventListener('play', () => {
  updatePlayPauseIcon();
  highlightCurrentSong();
});
audio.addEventListener('pause', () => {
  updatePlayPauseIcon();
  highlightCurrentSong();
});

// Hamburger menu logic for .btns hamburger
const btnsHamburger = document.querySelector('.btns .hamburger');
const leftSidebar = document.querySelector('.left');
const closeLibraryBtn = document.querySelector('.close-library-btn');
const sidebarOverlay = document.querySelector('.sidebar-overlay');
const libraryBtn = document.querySelector('.library');

function openSidebar() {
  leftSidebar.classList.add('open');
  if (sidebarOverlay) sidebarOverlay.classList.add('active');
}

function closeSidebar() {
  leftSidebar.classList.remove('open');
  if (sidebarOverlay) sidebarOverlay.classList.remove('active');
}

// Always set up close button and overlay event listeners
if (closeLibraryBtn) {
  closeLibraryBtn.addEventListener('click', closeSidebar);
}
if (sidebarOverlay) {
  sidebarOverlay.addEventListener('click', closeSidebar);
}

// Set up hamburger button if it exists
if (btnsHamburger && leftSidebar) {
  btnsHamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    openSidebar();
  });
}

// --- NEW: Library button opens sidebar and reloads library songs ---
if (libraryBtn) {
  libraryBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    fetchLibrarySongs(); // reload library songs
    openSidebar();
  });
}

shuffleBtn.addEventListener('click', () => {
  isShuffled = !isShuffled;
  shuffleBtn.classList.toggle('active', isShuffled);
});

repeatBtn.addEventListener('click', () => {
  repeatMode = (repeatMode + 1) % 3;
  repeatBtn.classList.toggle('active', repeatMode !== 0);
});

// Add search functionality
const searchInput = document.querySelector('.search-input');
searchInput.addEventListener('input', (e) => {
  const query = e.target.value.trim().toLowerCase();
  let filtered = playlist;
  if (query) {
    filtered = playlist.filter(song =>
      song.title.toLowerCase().includes(query) ||
      (song.artist && song.artist.toLowerCase().includes(query))
    );
  }
  buildPlaylistUI(filtered);
});

// --- Init ---
buildPlaylistUI();
loadSong(currentIndex, false);
audio.volume = 1;
updatePlayPauseIcon();
loadAllSongDurations(); // Load actual song durations

// Add event listeners for card play buttons
document.addEventListener('DOMContentLoaded', function() {
    // Event delegation for artist card navigation
    const cardContainer = document.querySelector('.card-container');
    if (cardContainer) {
        cardContainer.addEventListener('click', function(e) {
            let card = e.target;
            // Traverse up to .cards if needed
            while (card && !card.classList.contains('cards')) {
                card = card.parentElement;
            }
            if (card && card.classList.contains('cards')) {
                const artistDiv = card.querySelector('.card-artists');
                if (!artistDiv) return;
                const artistName = artistDiv.textContent.split(',')[0].trim();
                window.location.href = `artist.html?artist=${encodeURIComponent(artistName)}`;
            }
        });
    }

    // Add play button logic for Green-play (do not stop propagation)
    const cardPlayButtons = document.querySelectorAll('.Green-play');
    cardPlayButtons.forEach((button, index) => {
        button.addEventListener('click', (e) => {
            // Do not stopPropagation or preventDefault
            // Play a random song from the playlist when card is clicked
            const randomIndex = Math.floor(Math.random() * playlist.length);
            currentIndex = randomIndex;
            loadSong(currentIndex, true);
        });
    });

    // Add click event to 'All' button to restore full playlist
    const allBtn = document.querySelector('.btnss1');
    if (allBtn) {
        allBtn.addEventListener('click', function() {
            buildPlaylistUI();
        });
    }

    // Back button logic
    const backBtn = document.querySelector('.back-to-cards');
    if (backBtn) {
        backBtn.addEventListener('click', function() {
            document.querySelector('.charan-playlist').classList.remove('slide-left');
            document.querySelector('.artist-songs').classList.remove('active');
        });
    }

    // Add click event for Anirudh card to redirect to artist.html
    const anirudhCard = document.querySelector('.card-container .cards'); // first card is Anirudh
    if (anirudhCard) {
        anirudhCard.addEventListener('click', function(e) {
            // Prevent redirect if play button is clicked
            if (e.target.closest('.Green-play')) return;
            window.location.href = 'artist.html?artist=Anirudh%20Ravichander';
        });
    }

    fetchLibrarySongs();
});

// Function to get song duration from audio file
function getSongDuration(audioFile, index) {
  const tempAudio = new Audio(`./songs/${audioFile}`);
  
  // Set a timeout to prevent hanging
  const timeout = setTimeout(() => {
    playlist[index].duration = '--:--';
    buildPlaylistUI();
  }, 5000); // 5 second timeout
  
  tempAudio.addEventListener('loadedmetadata', function() {
    clearTimeout(timeout);
    if (!isNaN(tempAudio.duration) && tempAudio.duration > 0) {
      playlist[index].duration = secondsToMMSS(tempAudio.duration);
      console.log(`Loaded duration for ${audioFile}: ${playlist[index].duration}`);
      // Update the UI if this song is currently displayed
      buildPlaylistUI();
    } else {
      playlist[index].duration = '--:--';
      buildPlaylistUI();
    }
  });
  
  tempAudio.addEventListener('error', function() {
    clearTimeout(timeout);
    playlist[index].duration = '--:--';
    console.log(`Error loading duration for ${audioFile}`);
    buildPlaylistUI();
  });
  
  // Start loading the audio
  tempAudio.load();
}

// Load durations for all songs
function loadAllSongDurations() {
  console.log('Loading song durations...');
  playlist.forEach((song, index) => {
    // Set initial loading state
    playlist[index].duration = 'Loading...';
    buildPlaylistUI();
    
    // Load the actual duration
    getSongDuration(song.file, index);
  });
}

// Helper: fetch songs from iTunes API
async function fetchSongsByArtist(artist) {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(artist)}&entity=song&limit=10`;
    const response = await fetch(url);
    const data = await response.json();
    return data.results;
}

function showArtistSongs(artist) {
    const charanPlaylist = document.querySelector('.charan-playlist');
    const artistSongsSection = document.querySelector('.artist-songs');
    const artistTitle = document.querySelector('.artist-title');
    const artistSongList = document.querySelector('.artist-song-list');
    if (!charanPlaylist || !artistSongsSection) return;
    // Slide cards left
    charanPlaylist.classList.add('slide-left');
    // Show artist songs section
    artistSongsSection.classList.add('active');
    artistTitle.textContent = `Songs by ${artist}`;
    artistSongList.innerHTML = '<li>Loading...</li>';
    // Fetch and display songs
    fetchSongsByArtist(artist).then(songs => {
        if (!songs.length) {
            artistSongList.innerHTML = '<li>No songs found.</li>';
            return;
        }
        artistSongList.innerHTML = '';
        songs.forEach(song => {
            const li = document.createElement('li');
            li.innerHTML = `
                <button class="play-preview" title="Play Preview"></button>
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
                        btn.textContent = '\u25B6';
                    }
                });
                if (!audio) {
                    audio = new Audio(song.previewUrl);
                    playBtn.audio = audio;
                }
                if (audio.paused) {
                    audio.play();
                    playBtn.textContent = '\u23F8'; // Pause icon
                } else {
                    audio.pause();
                    playBtn.textContent = '\u25B6'; // Play icon
                }
                audio.onended = () => {
                    playBtn.textContent = '\u25B6';
                };
            });
            playBtn.textContent = '\u25B6'; // Play icon
            artistSongList.appendChild(li);
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
  fetchLibrarySongs();
});