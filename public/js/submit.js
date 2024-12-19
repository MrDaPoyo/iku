let openModal = false;

document.getElementById('submitTrackButton').addEventListener('click', function() {
    if (openModal) {
        const existingModal = document.getElementById('submitTrackModal');
        if (existingModal) {
            document.body.removeChild(existingModal);
        }
        openModal = false;
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

        const modalContent = `
            <h2>Submit Track</h2>
            <form id="submitTrackForm">
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
                <button type="button" id="closeModalButton">Cancel</button>
            </form>
        `;
        modal.innerHTML = modalContent;

        // Append modal to body
        document.body.appendChild(modal);

        // Close modal function
        document.getElementById('closeModalButton').addEventListener('click', function() {
            document.body.removeChild(modal);
            openModal = false;
        });

        // Handle form submission
        document.getElementById('submitTrackForm').addEventListener('submit', function(event) {
            event.preventDefault();
            // Handle track submission logic here
            alert('Track submitted!');
            document.body.removeChild(modal);
            openModal = false;
        });

        openModal = true;
    }
});