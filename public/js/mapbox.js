
export const displayMap = (locations) => {
  mapboxgl.accessToken = 'pk.eyJ1Ijoic2F1bG8tbWFjYW1iaXJhIiwiYSI6ImNrYzZocThoaTA3cHcyc2sxdHVhNXFrNDkifQ.iRNRYjVn45aJVyzBeVw63A';

  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/saulo-macambira/ckc6i1t2c1atk1io22bssj1c7',
    scrollZoom: false
    // center: [-116.214531, 51.417611], //longitude, latitude
    // zoom: 15,
    // interactive: false // interaction with the map will be disabled when false. Looking like an image
  });

  const bounds = new mapboxgl.LngLatBounds();

  locations.forEach(loc => {
    // Create marker
    const el = document.createElement('div');
    el.className = 'marker';

    // Add marker
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom' // the bottom of the element will point to the exact location on map
    }).setLngLat(loc.coordinates) //longitude, latitude format as MongoDB
      .addTo(map)

      // Add popup
      new mapboxgl.Popup({
        offset: 30
      }).setLngLat(loc.coordinates)
      .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`) // Add some content right into HTML
      .addTo(map)

      // Extend map bounds to include current location
      bounds.extend(loc.coordinates);
  });

  // fitBounds - Moves ans Zooms the map right to the bounds to actually fit our markers
  // Second argument accepts an object with 'paddding' property that specifies padding size from the marker when being
  // showed in the 'map' container
  map.fitBounds(bounds, {
    padding: {
      top: 200,
      bottom: 150,
      left: 100,
      right: 100
    }
  });

}
