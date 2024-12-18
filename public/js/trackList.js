document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/song/getSongsByUser');
        const songs = await response.json();

        const trackListContainer = document.createElement('div');
        trackListContainer.className = 'track-list';

        songs.forEach(song => {
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';

            const title = document.createElement('h3');
            title.textContent = song.title;

            const artist = document.createElement('p');
            artist.textContent = `Artist: ${song.artist}`;

            const album = document.createElement('p');
            album.textContent = `Album: ${song.album}`;

            const year = document.createElement('p');
            year.textContent = `Year: ${song.year}`;

            const genre = document.createElement('p');
            genre.textContent = `Genre: ${song.genre}`;

            trackItem.appendChild(title);
            trackItem.appendChild(artist);
            trackItem.appendChild(album);
            trackItem.appendChild(year);
            trackItem.appendChild(genre);

            trackListContainer.appendChild(trackItem);
        });

        document.getElementById("trackContainer").appendChild(trackListContainer);
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
});