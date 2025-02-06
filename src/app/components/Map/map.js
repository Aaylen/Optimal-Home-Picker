'use client'; 
import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const Map = () => {
  // Store the state for the map's center and zoom level
  const [map, setMap] = useState(null);

  // The coordinates for the map's initial center
  const center = {
    lat: 37.7749,  // Example: San Francisco latitude
    lng: -122.4194 // Example: San Francisco longitude
  };

  const zoom = 12; // Initial zoom level

  // Handle map loading (optional)
  const onLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  // Handle the callback after the map is loaded
  const onUnmount = () => {
    setMap(null);
  };

  const mapOptions = {
    streetViewControl: false,
    // mapTypeControlOptions: {
    //   position: window.google.maps.ControlPosition.BOTTOM_CENTER // Move map type control to the bottom center
    // }
  };

  return (
    <div style={{ height: '100%', width: '100%' , padding: '0', margin: '0' }}>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}>
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={center}
          zoom={zoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={mapOptions}
        >
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default Map;
