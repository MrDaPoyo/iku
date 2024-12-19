document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/song/getSongsByUser');
        const songs = await response.json();

        const trackListContainer = document.createElement('div');
        trackListContainer.className = 'track-list';

        songs.forEach(song => {
            const card = `
                <div class="track">
                    <div class="track-image">
                        <img src="https://placehold.co/600x400" alt="${song.title}">
                    </div>
                    <div>
                        <div class="track-title">${song.title}</div>
                        <div class="track-artist">${song.artist}</div>
                    </div>
                    <div>
                        <div class="track-date">${song.year}</div>
                        <div class="track-duration">${song.duration}</div>
                    </div>
                </div>
            `;

            const link = document.createElement('a');
            link.id = `track-${song.id}`;
            link.href = `/?track_id=${song.id}`;
            link.innerHTML = card;

            trackListContainer.appendChild(link);
        });

        document.getElementById("trackContainer").appendChild(trackListContainer);
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
});