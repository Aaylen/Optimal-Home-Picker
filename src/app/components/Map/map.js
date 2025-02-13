'use client'; 
import React, { useState, useContext, useEffect } from 'react';
import { GoogleMap, Marker, InfoWindow } from '@react-google-maps/api';
import { POIContext } from '@/app/context/POIContext';

const Map = ({ center, markerPosition }) => {
  const [map, setMap] = useState(null);
  const { categorySearch, setSelectedPOI, selectedPOI, emoji, POIsAndEmojis } = useContext(POIContext);

  useEffect(() => {
    if(categorySearch){
      console.log('categorySearch', categorySearch);
    }
  }, [categorySearch]);

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
      id: categorySearch?.id ?? null,
      name: place?.name ?? '',
      placeId: place?.placeId ?? null,
      location: place?.location ?? null,
      drivingDistance: place?.drivingDistance ?? null,
      drivingDuration: place?.drivingDuration ?? null
    });
  };

  const getEmojiIcon = (emoji, isSelected, isHouse) => {
    let size = isSelected ? 40 : 28;
    size = isHouse ? 32 : size;
  
    // Create an offscreen canvas
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
  
    // Set font and draw the emoji
    ctx.font = `${size}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(emoji, size / 2, size / 1.75);
  
    // Convert to data URL
    return {
      url: canvas.toDataURL(), 
      scaledSize: new window.google.maps.Size(size, size)
    };
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
        {markerPosition && <Marker position={markerPosition} icon={getEmojiIcon('🏠',false, true)}/>}
        {categorySearch?.places?.map((place, index) => (
          <Marker
            key={index}
            position={place.location}
            onClick={() => handleCategoryClick(place)}
            title={place.name}
            icon={getEmojiIcon(emoji, selectedPOI?.placeId === place?.placeId, false)}
          >
          </Marker>
        ))}
        {POIsAndEmojis?.map((poi, index) => (
          <Marker
            key={index}
            position={poi.location}
            title={poi.name}
            icon={getEmojiIcon(poi.emoji, selectedPOI?.placeId === poi?.placeId, false)}
            onClick={() => handleCategoryClick(poi)}
          />
        ))}
      </GoogleMap>
    </div>
  );
};

export default Map;
