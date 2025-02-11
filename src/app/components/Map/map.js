'use client'; 
import React, { useState, useContext, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { POIContext } from '@/app/context/POIContext';

const Map = ({ center, markerPosition }) => {
  const [map, setMap] = useState(null);
  const { categorySearch } = useContext(POIContext);
  const { setSelectedPOI } = useContext(POIContext);
  const { selectedPOI } = useContext(POIContext);

  useEffect(() => {
    if (categorySearch) {
      console.log("Updating map with category results:", categorySearch);
    }
  }, [categorySearch]);
  useEffect(() => {
    if (selectedPOI) {
      console.log("SelectedPOI:", selectedPOI);
    } else {
      console.log("No POI selected");
    }
  }, [selectedPOI]);

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

  const handleCategoryClick = (place) => {
    setSelectedPOI({
      id: categorySearch.id,
      name: place.name,
      placeId: place.placeId
    });
    console.log("Selected POI:", place.name, place.placeId);
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
        {categorySearch && categorySearch.places && categorySearch.places.map((place, index) => (
          <Marker
            key={index}
            position={place.location}
            onClick={() => handleCategoryClick(place)}
            title={place.name}
            icon={{
              url: (selectedPOI && selectedPOI.placeId === place.placeId) ? 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' : 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
            }}
          >
          </Marker>
        ))}
      </GoogleMap>
    </div>
  );
};

export default Map;
