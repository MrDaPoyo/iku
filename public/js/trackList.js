document.addEventListener('DOMContentLoaded', async () => {
    try {
        const [songsResponse, playlistsResponse] = await Promise.all([
            fetch('/song/getSongsByUser'),
            fetch('/playlist/getPlaylistsByUser')
        ]);
        const songs = await songsResponse.json();
        const playlists = await playlistsResponse.json();

        if (!songs.length && !playlists.length) {
            const noTracks = document.createElement('h3');
            noTracks.textContent = 'No tracks or playlists found, try uploading or creating one first!';
            document.getElementById("trackContainer").appendChild(noTracks);
            return;
        }

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
                    <img class="track-image" src="${song.cover ? `/song/getCover/${song.id}` : 'https://placehold.co/300'}" alt="${song.title}">
                    <div class="track-info">
                        <h2 class="track-title">${song.title}</h2>
                        <p class="track-artist"><strong>${song.artist}</strong> - ${song.album}</p>
                    </div>
                </a>
                <div>
                    <h4 class="track-date">${song.year}</h4>
                    <h3 class="track-duration">${formattedLength}</h3>
                </div>
            `;
            document.getElementById("trackContainer").appendChild(card);
        });

        playlists.forEach(async playlist => {
            const card = document.createElement('div');
            card.className = 'playlistItem';
            const trackTitles = await Promise.all(playlist.tracks.map(async trackId => {
                const response = await fetch(`/song/data/${trackId}`);
                const track = await response.json();
                return track.title;
            }));

            card.innerHTML = `
                <a href="/?playlist_id=${playlist.id}" class="playlist-link">
                    <img class="playlist-image" src="${playlist.cover ? `/playlist/getCover/${playlist.id}` : 'https://placehold.co/300'}" alt="${playlist.title}">
                    <div class="playlist-info">
                        <h3 class="playlist-title">${playlist.name}</h3>
                        <p class="playlist-description">${playlist.description}</p>
                        <small class="playlist-tracks">${trackTitles.join(', ')}</small>
                    </div>
                </a>
            `;
            document.getElementById("playlistContainer").appendChild(card);
        });
    } catch (error) {
        console.error('Error fetching songs or playlists:', error);
    }
});