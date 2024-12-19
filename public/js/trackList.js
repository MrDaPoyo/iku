document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/song/getSongsByUser');
        const songs = await response.json();

        const trackListContainer = document.createElement('div');
        trackListContainer.className = 'track-list';
        songs.forEach(song => {
            const minutes = Math.floor(song.length / 60);
            const seconds = song.length % 60;
            const formattedLength = `${minutes}:${seconds.toString().padStart(2, '0')}`;

            const card = document.createElement('div');
            card.className = 'track';
            card.innerHTML = `
                <a href="/?track_id=${song.id}" class="track-link">
                    <div class="track-image">
                        <img src="${song.cover || 'https://placehold.co/300'}" alt="${song.title}">
                    </div>
                    <div>
                        <h2 class="track-title">${song.title}</h2>
                        <div class="track-artist"><h3>${song.artist}</h3> - ${song.album}</div>
                    </div>
                </a>
                <div>
                    <h4 class="track-date">${song.year}</h4>
                    <h3 class="track-duration">${formattedLength}</h3>
                </div>
            `;
            document.getElementById("trackContainer").appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
});