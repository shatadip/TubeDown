document.getElementById('fetchInfoBtn').addEventListener('click', function() {
    const url = document.getElementById('url').value;
    fetch(`/fetch-info?url=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then(data => {
            // Display thumbnails
            const thumbnailsDiv = document.getElementById('thumbnails');
            thumbnailsDiv.innerHTML = ''; // Clear previous thumbnails
            thumbnailsDiv.style.display = 'block';

            // Assuming you want the first thumbnail or the highest resolution one
            const thumbnail = data.thumbnails[0]; // Choose the first thumbnail
            // Alternatively, you can sort thumbnails by resolution and choose the highest
            // const thumbnail = data.thumbnails.sort((a, b) => b.width - a.width)[0];

            const img = document.createElement('img');
            img.src = thumbnail.url;
            img.alt = `Thumbnail for ${data.title}`;
            thumbnailsDiv.appendChild(img);

            // Populate quality options
            const qualitySelect = document.getElementById('quality');
            qualitySelect.innerHTML = ''; // Clear previous options
            const options = new Set(); // Use a Set to keep track of unique values
            data.formats.forEach(format => {
                // Only add the option if it hasn't been added before
                if (!options.has(format.qualityLabel)) {
                    const option = document.createElement('option');
                    option.value = format.qualityLabel;
                    option.textContent = format.qualityLabel;
                    qualitySelect.appendChild(option);
                    options.add(format.qualityLabel); // Add the value to the Set
                }
            });
            qualitySelect.style.display = 'block';

            // Show download button
            document.getElementById('downloadBtn').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching video info:', error);
        });
});

// Prevent form submission until info is fetched
document.getElementById('downloadForm').addEventListener('submit', function (event) {
    if (document.getElementById('quality').value === '') {
        event.preventDefault();
        alert('Please fetch video info before downloading.');
    }
});
