const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const audioElement = document.getElementById('audioPlayer');
const audioSrc = audioCtx.createMediaElementSource(audioElement);
const analyser = audioCtx.createAnalyser();

audioSrc.connect(analyser);
analyser.connect(audioCtx.destination);

const canvas = document.getElementById('audioVisualizer');
const canvasCtx = canvas.getContext('2d');

audioElement.src = '/song/elevator-music-bossa-nova.mp3';

function draw() {
    requestAnimationFrame(draw);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteFrequencyData(dataArray);

    canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.5, 'yellow');
    gradient.addColorStop(1, 'green');
    canvasCtx.fillStyle = gradient;

    for (let i = 0; i < bufferLength; i++) {
        barHeight = dataArray[i];

        canvasCtx.fillRect(x, canvas.height - barHeight / 3, barWidth, barHeight / 2);

        x += barWidth + 1;
    }
}

audioElement.onplay = function () {
    audioCtx.resume().then(() => {
        draw();
        updateProgressBar();
    });
};

function updateProgressBar() {
    const currentTime = audioElement.currentTime;
    const songLength = audioElement.duration;
    var percentage = (currentTime / songLength) * 100;
    const progressBarFill = document.getElementById('title-progress');
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
    // Implement the logic for the next button
    console.log('Next button clicked');
});

document.getElementById('pastButton').addEventListener('click', () => {
    // Implement the logic for the past button
    console.log('Past button clicked');
});

document.getElementById('stopButton').addEventListener('click', () => {
    audioElement.pause();
    audioElement.currentTime = 0;
});

audioElement.addEventListener('pause', () => {
    clearInterval(currentTrackInterval);
});