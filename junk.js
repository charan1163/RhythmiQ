// List of songs (can be mp3 links or local files)
const songs = [
    'song1.mp3', // Replace with your song URLs or file paths
    'song2.mp3',
    'song3.mp3',
];

// Current song index
let currentSongIndex = 0;

// Get audio element and source
const audioPlayer = document.getElementById('audioPlayer');
const audioSource = document.getElementById('audioSource');

// Load and play the current song
function loadSong() {
    audioSource.src = songs[currentSongIndex];
    audioPlayer.load();  // Load new song
    audioPlayer.play();  // Play it automatically
}

// Play next song
function nextSong() {
    currentSongIndex = (currentSongIndex + 1) % songs.length; // Loop back to first song if at end
    loadSong();
}

// Play previous song
function prevSong() {
    currentSongIndex = (currentSongIndex - 1 + songs.length) % songs.length; // Loop to last song if at beginning
    loadSong();
}

// Initially load the first song
loadSong();
