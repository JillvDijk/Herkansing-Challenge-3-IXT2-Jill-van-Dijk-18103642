var lat;
var lon;

mapboxgl.accessToken = 'pk.eyJ1Ijoicm95ZXZhbmRpamsiLCJhIjoiY2p0NXJnbTRpMDh0ZTN6cnVyd24xaTdlbCJ9.kCp52B18Bm8EonaSgytxPQ';

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-96, 37.8], // starting position
    zoom: 3 // starting zoom
});

var geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
});

map.addControl(geolocate);

var geocoder = new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl,
    marker: false,
    placeholder: 'Search nearby...',
    bbox: [4.498460425480685, 52.1991035, 4.570413774519315, 52.2711035],
    proximity: {
      longitude: 4.5429862,
      latitude: 52.242173199999996
    }
});

map.addControl(geocoder);

geolocate.on('geolocate', function(e) {
    map.removeControl(geocoder);

    lat = e.coords.latitude;
    lon = e.coords.longitude;
    
    var offsetLat = 0.036;
    var offsetLon = offsetLat * Math.cos(offsetLat);

    var bbox = [lon-offsetLon, lat-offsetLat, lon+offsetLon, lat+offsetLat];

    geocoder = new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        mapboxgl: mapboxgl,
        marker: false,
        placeholder: 'Search nearby...',
        bbox: bbox,
        proximity: {
            longitude: lon,
            latitude: lat
        }
    });

    getApiData();
    map.addControl(geocoder);
    let searchNearby = document.querySelector('.mapboxgl-ctrl-geocoder');
    setTimeout(function() {
        searchNearby.classList.add('active');
    }, 100);
    
});

function getApiData() {

    var url = 'https://api.openweathermap.org/data/2.5/weather';
    var apiKey ='efa9aceacdd609cd237da4f568b37ed8';
    var request = url + '?appid=' + apiKey + '&lat=' + lat + '&lon=' + lon;

    fetch(request)

    .then((response) => {
        if(!response.ok) throw Error(response.statusText);
        return response.json();
    })
    .then((data) => {
        console.log('Success:', data);
      succes(data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function succes(response) {
    var tempC = toC(response.main.temp);
    var report = 'Weather: <br>' + response.weather[0].description + '<br>' + tempC + '°';
    var popup = new mapboxgl.Popup().setHTML(report);
    var marker = new mapboxgl.Marker().setLngLat([lon, lat]).setPopup(popup).addTo(map);
}

function toC(tempC) {
    return Math.round(((tempC - 273.15) * 10)) / 10;
}
