'use client'; 
import React, { useState } from 'react';
import { GoogleMap, Marker } from '@react-google-maps/api';

const Map = ({ center, markerPosition }) => {
  const [map, setMap] = useState(null);

  const onLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  const onUnmount = () => {
    setMap(null);
  };

  const mapOptions = {
    streetViewControl: false,
    // mapTypeControlOptions: {
    //   position: window.google.maps.ControlPosition.BOTTOM_CENTER
    // }
  };

  return (
    <div style={{ height: '100%', width: '100%', padding: '0', margin: '0' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={12}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {markerPosition && <Marker position={markerPosition} />}
      </GoogleMap>
    </div>
  );
};

export default Map;
