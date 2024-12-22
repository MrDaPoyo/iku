let trackOpenModal = false;

document.getElementById('submitTrackButton').addEventListener('click', function () {
    if (trackOpenModal) {
        const existingModal = document.getElementById('submitPlaylistModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        trackOpenModal = false;
    } else {
        // Create modal elements
        const modal = document.createElement('div');
        modal.id = 'submitTrackModal';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = '#fff';
        modal.style.padding = '20px';
        modal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        modal.style.zIndex = '1000';
        const overlay = document.createElement('div');
        overlay.id = 'modalOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        document.body.appendChild(overlay);

        overlay.addEventListener('click', function () {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
            trackOpenModal = false;
        });
        const modalContent = `
            <h2>Submit Track</h2>
            <form id="submitTrackForm" method="POST" enctype="multipart/form-data" action="/song/submit">
            <div style="display: flex; justify-content: space-between;">
                <div style="flex: 1; margin-right: 5px;">
                <label for="trackName">Track Name:</label>
                <input type="text" id="trackName" name="trackName" required>
                </div>
                <div style="flex: 1;">
                <label for="artist">Artist:</label>
                <input type="text" id="artist" name="artist" required>
                </div>
            </div>
            <br>
            <div style="display: flex; justify-content: space-between;">
                <div style="flex: 1; margin-right: 5px;">
                <label for="album">Album:</label>
                <input type="text" id="album" name="album">
                </div>
                <div style="flex: 1;">
                <label for="year">Year:</label>
                <input type="number" id="year" name="year" required>
                </div>
            </div>
            <br>
            <div style="display: flex; justify-content: space-between;">
                <div style="flex: 1; margin-right: 5px;">
                <label for="genre">Genre:</label>
                <input type="text" id="genre" name="genre" required>
                </div>
            </div>
            <br>
            <div style="display: flex; justify-content: space-between;">
                <div style="flex: 1;">
                <label for="cover">Cover:</label>
                <input type="file" id="cover" name="cover">
                </div>
            </div>
            <br>
            <div style="display: flex; justify-content: space-between;">
                <div style="flex: 1; margin-right: 5px;">
                <label for="trackFile">Track File:</label>
                <input type="file" id="trackFile" name="trackFile" required>
                </div>
            </div>
            <br>
            <button type="submit">Submit</button>
            <button type="button" id="closePlaylistModalButton">Cancel</button>
            </form>
        `;
        modal.innerHTML = modalContent;

        // Append modal to body
        document.body.appendChild(modal);

        // Close modal function
        document.getElementById('closePlaylistModalButton').addEventListener('click', function () {
            document.body.removeChild(modal);
            trackOpenModal = false;
        });

        // Handle form submission
        document.getElementById('submitTrackForm').addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = new FormData(this);
            fetch('/song/submit', {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    console.log(response)
                    if (response.redirected) {
                        window.location.href = response.url;
                    } else {
                        return response.text();
                    }
                })
                .then(result => {
                    if (result) {
                        alert(result);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
            trackOpenModal = false;
        });
        trackOpenModal = true;
    };
});

let playlistOpenModal = false;

document.getElementById('submitPlaylistButton').addEventListener('click', function () {
    if (playlistOpenModal) {
        const existingModal = document.getElementById('submitPlaylistModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        playlistOpenModal = false;
    } else {
        // Create modal elements
        const modal = document.createElement('div');
        modal.id = 'submitPlaylistModal';
        modal.style.position = 'fixed';
        modal.style.top = '50%';
        modal.style.left = '50%';
        modal.style.transform = 'translate(-50%, -50%)';
        modal.style.backgroundColor = '#fff';
        modal.style.padding = '20px';
        modal.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
        modal.style.zIndex = '1000';
        const overlay = document.createElement('div');
        overlay.id = 'modalOverlay';
        overlay.style.position = 'fixed';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%';
        overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        overlay.style.zIndex = '999';
        document.body.appendChild(overlay);

        overlay.addEventListener('click', function () {
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
            playlistOpenModal = false;
        });
        const modalContent = `
            <h2>Create a Playlist!</h2>
            <form id="submitPlaylistForm" method="POST" enctype="multipart/form-data" action="/playlist/create">
            <div style="display: flex; justify-content: space-between;">
            <div style="flex: 1; margin-right: 5px;">
            <label for="name">Name:</label>
            <input type="text" id="name" name="name" required>
            </div>
            <div style="flex: 1;">
            <label for="description">Description:</label>
            <input type="text" id="description" name="description">
            </div>
            </div>
            <br>
            <div style="display: flex; justify-content: space-between;">
            <div style="flex: 1; margin-right: 5px;">
                <label for="cover">Cover:</label>
                <input type="file" id="cover" name="cover">
            </div>
            </div>
            <br>
            <button type="submit">Submit</button>
            <button type="button" id="closeModalButton">Cancel</button>
            </form>
        `;
        modal.innerHTML = modalContent;

        // Append modal to body
        document.body.appendChild(modal);

        // Close modal function
        document.getElementById('closeModalButton').addEventListener('click', function () {
            document.body.removeChild(modal);
            playlistOpenModal = false;
        });

        // Handle form submission
        document.getElementById('submitPlaylistForm').addEventListener('submit', function (event) {
            event.preventDefault();
            const formData = new FormData(this);
            fetch('/playlist/create', {
                method: 'POST',
                body: formData
            })
                .then(response => {
                    console.log(response)
                    if (response.redirected) {
                        window.location.href = response.url;
                    } else {
                        return response.text();
                    }
                })
                .then(result => {
                    if (result) {
                        alert(result);
                        window.location.reload();
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            document.body.removeChild(modal);
            document.body.removeChild(overlay);
            playlistOpenModal = false;
        });
        playlistOpenModal = true;
    };
});