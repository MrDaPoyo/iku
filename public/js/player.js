const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioElement = document.getElementById('audioPlayer');
const audioSrc = audioCtx.createMediaElementSource(audioElement);
const analyser = audioCtx.createAnalyser();

audioSrc.connect(analyser);
analyser.connect(audioCtx.destination);

const canvas = document.getElementById('audioVisualizer');
const canvasCtx = canvas.getContext('2d');
let songId = new URLSearchParams(window.location.search).get('track_id') || 1;
const playlistId = new URLSearchParams(window.location.search).get('playlist_id');
let playlistIndex = new URLSearchParams(window.location.search).get('playlist_index') || 0;

function selectSong(songId, playlistId, playlistIndex) {
    let songUrl;
    if (playlistId) {
        songUrl = `/playlist/get/${playlistId}/getTrack/${playlistIndex}`;
    } else {
        songUrl = `/song/get/${songId}`;
    }
    audioElement.src = songUrl;
    audioElement.onerror = () => {
        console.error('Failed to load the song.');
        document.getElementById('title-artist').innerText = "Absolutely No One";
        const titleText = document.getElementById('title-text');
        titleText.innerText = `Song not found.`;
    };

    fetch(`/song/data/${songId}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                console.warn('No data found');
                document.getElementById('title-artist').innerText = "Absolutely No One";
                const titleText = document.getElementById('title-text');
                titleText.innerText = `Song not found.`;
            } else if (data.artist && data.title) {
                console.log('Song data:', data);
                // Update the song title and author
                document.getElementById('title-artist').innerText = data.artist;
                const titleText = document.getElementById('title-text');
                titleText.innerText = `${data.title}`;
            } else {
                console.warn('No data found');
                document.getElementById('title-artist').innerText = "Absolutely No One";
                const titleText = document.getElementById('title-text');
                titleText.innerText = `Song not found.`;
            }
        })
        .catch(error => console.error('Error fetching song data:', error));
}

selectSong(songId, playlistId, playlistIndex);

function draw() {
    requestAnimationFrame(draw);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 10;
    let barHeight;
    let x = 0;

    const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#E41E21'); // red
    gradient.addColorStop(0.33, '#F09C1C'); // orange
    gradient.addColorStop(0.66, '#0C85EC'); // blue
    gradient.addColorStop(1, '#3EB081'); // green
    canvasCtx.fillStyle = gradient;

    const minHeight = 5; // Minimum height for the bars

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i] / 2;
        barHeight = Math.max(barHeight, minHeight); // Ensure the bar height is at least minHeight

        canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

        x += barWidth + 1;
    }
}

draw();

audioElement.onplay = function () {
    audioCtx.resume().then(() => {
        draw();
        updateProgressBar();
    });
};

const progressBarFill = document.getElementById('title-progress');
const progressBarInput = document.getElementById('title-progress-slider');
progressBarFill.addEventListener('mouseover', (event) => {
    const rect = progressBarFill.getBoundingClientRect();
    const relativeY = event.clientY - rect.top;
    progressBarInput.style.top = `${relativeY - progressBarInput.offsetHeight / 2}px`;
});

let wasPlaying = false;

progressBarFill.addEventListener('mouseleave', () => {
    progressBarInput.style.top = '50%';
});

progressBarInput.addEventListener('input', () => {
    const percentage = progressBarInput.value;
    audioElement.currentTime = (percentage / 100) * audioElement.duration;
    updateProgressBar();
});

progressBarInput.addEventListener('mousedown', () => {
    wasPlaying = !audioElement.paused;
    if (wasPlaying) {
        audioElement.pause();
    }
});

progressBarInput.addEventListener('mouseup', () => {
    if (wasPlaying) {
        audioElement.play();
    }
});

// Make it phone friendly
progressBarFill.addEventListener('touchstart', (event) => {
    const rect = progressBarFill.getBoundingClientRect();
    const relativeY = event.touches[0].clientY - rect.top;
    progressBarInput.style.top = `${relativeY - progressBarInput.offsetHeight / 2}px`;
    wasPlaying = !audioElement.paused;
    if (wasPlaying) {
        audioElement.pause();
    }
});

progressBarFill.addEventListener('touchend', () => {
    progressBarInput.style.top = '50%';
    if (wasPlaying) {
        audioElement.play();
    }
});

progressBarInput.addEventListener('touchmove', (event) => {
    const rect = progressBarFill.getBoundingClientRect();
    const touchX = event.touches[0].clientX - rect.left;
    const percentage = (touchX / rect.width) * 100;
    progressBarInput.value = percentage;
    audioElement.currentTime = (percentage / 100) * audioElement.duration;
    updateProgressBar();
});

function updateProgressBar() {
    const currentTime = audioElement.currentTime;
    const songLength = audioElement.duration;
    var percentage = (currentTime / songLength) * 100;
    progressBarFill.style.background = `linear-gradient(90deg, var(--green) ${percentage}%, var(--white) ${percentage}%)`;
    progressBarFill.style.backgroundClip = 'text';
    progressBarFill.style.textFillColor = 'transparent';
    if (!audioElement.paused) {
        requestAnimationFrame(updateProgressBar);
    }
}

document.getElementById('playButton').addEventListener('click', () => {
    if (audioElement.paused) {
        audioElement.play();
    } else {
        audioElement.pause();
    }
});

document.getElementById('nextButton').addEventListener('click', () => {
    if (playlistId) {
        fetch(`/playlist/get/${playlistId}/nextTrack`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    const nextTrackElement = document.getElementById('nextTrack');
                    const trackTitle = document.createElement('p');
                    trackTitle.textContent = data.title;
                    trackTitle.onclick = function() {
                        selectSong(data.id, playlistId, data.playlistIndex);
                    };
                    const trackArtist = document.createElement('small');
                    trackArtist.textContent = data.artist;
                    nextTrackElement.innerHTML = '';
                    nextTrackElement.appendChild(trackTitle);
                    nextTrackElement.appendChild(trackArtist);
                } else {
                    document.getElementById('nextTrack').innerHTML = '<p>No next track available</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching next track:', error);
                document.getElementById('nextTrack').innerHTML = '<p>Error loading next track</p>';
            });
    }
});

document.getElementById('pastButton').addEventListener('click', () => {
    if (playlistId) {
        fetch(`/playlist/get/${playlistId}/previousTrack`)
            .then(response => response.json())
            .then(data => {
                if (data) {
                    const pastTrackElement = document.getElementById('pastTrack');
                    const trackTitle = document.createElement('p');
                    trackTitle.textContent = data.title;
                    trackTitle.onclick = function() {
                        selectSong(data.id, playlistId, data.playlistIndex);
                    };
                    const trackArtist = document.createElement('small');
                    trackArtist.textContent = data.artist;
                    pastTrackElement.innerHTML = '';
                    pastTrackElement.appendChild(trackTitle);
                    pastTrackElement.appendChild(trackArtist);
                } else {
                    document.getElementById('pastTrack').innerHTML = '<p>No previous track available</p>';
                }
            })
            .catch(error => {
                console.error('Error fetching previous track:', error);
                document.getElementById('pastTrack').innerHTML = '<p>Error loading previous track</p>';
            });
    }
});
let currentTrackInterval;

audioElement.addEventListener('pause', () => {
    clearInterval(currentTrackInterval);
});
document.getElementById('stopButton').addEventListener('click', () => {
    audioElement.pause();
    audioElement.currentTime = 0;
});

audioElement.addEventListener('pause', () => {
    clearInterval(currentTrackInterval);
});

var repeatButton = document.getElementById('repeatButton');
var loop = false;

repeatButton.addEventListener('click', () => {
    loop = !loop;
    if (loop) {
        console.log('Looping enabled');
        repeatButton.style.backgroundColor = 'var(--green)';
    } else {
        console.log('Looping disabled');
        repeatButton.style.backgroundColor = '';
    }
});

audioElement.addEventListener('ended', () => {
    if (!loop) {
        if (playlistId) {
            fetch(`/playlist/get/${playlistId}/nextTrack`)
                .then(response => response.json())
                .then(data => {
                    console.log('Next track:', data);
                    if (data.id) {
                        selectSong(data.id, playlistId, playlistIndex);
                        audioElement.play();
                    } else {
                        console.warn('No next track found');
                    }
                })
                .catch(error => console.error('Error fetching next track:', error));
        }
    } else {
        audioElement.play();
    }
});