document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/song/getSongsByUser');
        const songs = await response.json();

        const trackListContainer = document.createElement('div');
        trackListContainer.className = 'track-list';

        songs.forEach(song => {
            const trackItem = document.createElement('div');
            trackItem.className = 'track-item';

            const title = document.createElement('h2');
            const titleLink = document.createElement('a');
            titleLink.href = `/?track_id=${song.id}`;
            titleLink.textContent = song.title;
            titleLink.style.flex = '2';
            title.appendChild(titleLink);

            const artist = document.createElement('strong');
            artist.textContent = `Made by ${song.artist}`;
            artist.style.flex = '1';

            const album = document.createElement('small');
            album.textContent = `${song.album}`;
            album.style.flex = '1';

            const year = document.createElement('h3');
            year.textContent = `${song.year}`;
            year.style.flex = '1';

            const genre = document.createElement('p');
            genre.textContent = `${song.genre}`;
            genre.style.flex = '1';

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