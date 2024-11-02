// Initialize the map
const map = L.map('map').setView([0, 0], 2);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
}).addTo(map);

// Load entries from localStorage or initialize as empty array
let entries = JSON.parse(localStorage.getItem('hamLoggerEntries') || '[]');
console.log("Loaded entries from localStorage:", entries); // Debug log
if (entries.length > 0) {
    entries.forEach(addPinToMap); // Add pins to map on page load
}

// Click event to fill latitude and longitude inputs
map.on('click', function(e) {
    document.getElementById('latitude').value = e.latlng.lat.toFixed(6);
    document.getElementById('longitude').value = e.latlng.lng.toFixed(6);
});

function addEntry() {
    const callSign = document.getElementById('callSign').value;
    const lat = parseFloat(document.getElementById('latitude').value);
    const lng = parseFloat(document.getElementById('longitude').value);
    const dateHeard = document.getElementById('dateHeard').value;
    const notes = document.getElementById('notes').value;

    if (!callSign || isNaN(lat) || isNaN(lng)) {
        alert('Please enter valid call sign and location.');
        return;
    }

    const entry = { callSign, location: { lat, lng }, dateHeard, notes };
    entries.push(entry);
    localStorage.setItem('hamLoggerEntries', JSON.stringify(entries)); // Save the entire database to local storage
    
    addPinToMap(entry);
    document.getElementById('loggerForm').reset();
}

function addPinToMap(entry) {
    if (entry && entry.location && !isNaN(entry.location.lat) && !isNaN(entry.location.lng)) {
        const marker = L.marker([entry.location.lat, entry.location.lng]).addTo(map);
        marker.bindPopup(`<b>${entry.callSign}</b><br>Date Heard: ${entry.dateHeard}<br>${entry.notes}`);
    } else {
        console.warn("Invalid entry skipped:", entry); // Debug log for invalid entry
    }
}

function exportCSV() {
    const csvContent = "data:text/csv;charset=utf-8,"
        + entries.map(e => `${e.callSign},${e.location.lat},${e.location.lng},${e.dateHeard},"${e.notes}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "ham_logger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function importCSV(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const rows = text.split("\n");
        rows.forEach(row => {
            const [callSign, lat, lng, dateHeard, notes] = row.split(',');
            if (callSign && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))) {
                const entry = { callSign, location: { lat: parseFloat(lat), lng: parseFloat(lng) }, dateHeard, notes: notes.replace(/"/g, '') };
                entries.push(entry);
                addPinToMap(entry);
            }
        });
        localStorage.setItem('hamLoggerEntries', JSON.stringify(entries)); // Save entire database to local storage
    };
    reader.readAsText(file);
}
