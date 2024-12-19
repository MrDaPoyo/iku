document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/song/getSongsByUser');
        const songs = await response.json();

        const trackListContainer = document.createElement('div');
        trackListContainer.className = 'track-list';

        songs.forEach(song => {
            const card = document.createElement('div');
            card.className = 'track';

            const cardImage = document.createElement('div');
            cardImage.className = 'track-image';
            const img = document.createElement('img');
            img.src = 'https://placehold.co/600x400'; // Placeholder image
            img.alt = song.title;
            cardImage.appendChild(img);

            const cardContent = document.createElement('div');
            const cardTitle = document.createElement('div');
            cardTitle.className = 'track-title';
            cardTitle.textContent = song.title;
            const cardArtist = document.createElement('div');
            cardArtist.className = 'track-artist';
            cardArtist.textContent = song.artist;
            cardContent.appendChild(cardTitle);
            cardContent.appendChild(cardArtist);

            const cardDetails = document.createElement('div');
            const cardDate = document.createElement('div');
            cardDate.className = 'track-date';
            cardDate.textContent = song.year; // Assuming year is the date
            const cardDuration = document.createElement('div');
            cardDuration.className = 'track-duration';
            cardDuration.textContent = song.duration; // Assuming duration is available
            cardDetails.appendChild(cardDate);
            cardDetails.appendChild(cardDuration);

            card.appendChild(cardImage);
            card.appendChild(cardContent);
            card.appendChild(cardDetails);

            const link = document.createElement('a');
            link.id = `track-${song.id}`;
            link.href = `/?track_id=${song.id}`; // Assuming you want a placeholder link
            link.appendChild(card);

            trackListContainer.appendChild(link);
        });

        document.getElementById("trackContainer").appendChild(trackListContainer);
    } catch (error) {
        console.error('Error fetching songs:', error);
    }
});