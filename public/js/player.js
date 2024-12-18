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

    const barWidth = (canvas.width / bufferLength) * 10;
    let barHeight;
    let x = 0;

    const gradient = canvasCtx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, '#E41E21'); // red
    gradient.addColorStop(0.33, '#F09C1C'); // orange
    gradient.addColorStop(0.66, '#0C85EC'); // blue
    gradient.addColorStop(1, '#3EB081'); // green
    canvasCtx.fillStyle = gradient;
    // canvasCtx.fillStyle = 'rgb(255, 255, 255)';

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

progressBarFill.addEventListener('mouseleave', () => {
    progressBarInput.style.top = '50%';
});

progressBarInput.addEventListener('input', () => {
    const percentage = progressBarInput.value;
    audioElement.currentTime = (percentage / 100) * audioElement.duration;
    updateProgressBar();
});

// Make it phone friendly
progressBarFill.addEventListener('touchstart', (event) => {
    const rect = progressBarFill.getBoundingClientRect();
    const relativeY = event.touches[0].clientY - rect.top;
    progressBarInput.style.top = `${relativeY - progressBarInput.offsetHeight / 2}px`;
});

progressBarFill.addEventListener('touchend', () => {
    progressBarInput.style.top = '50%';
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
