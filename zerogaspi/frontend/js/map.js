// This file contains JavaScript for integrating map functionalities, such as displaying partner locations.

function initMap() {
    // Initialize and add the map
    const map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
        center: { lat: -34.397, lng: 150.644 }, // Default center
    });

    // Example of adding a marker
    const marker = new google.maps.Marker({
        position: { lat: -34.397, lng: 150.644 },
        map: map,
        title: "Partner Location",
    });
}

// Load the map script asynchronously
function loadMapScript() {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&callback=initMap`;
    script.async = true;
    document.head.appendChild(script);
}

// Call the function to load the map script
loadMapScript();