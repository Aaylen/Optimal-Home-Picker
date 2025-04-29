'use client';
import React, { useState, useEffect } from 'react';
import { GoogleMap } from '@react-google-maps/api';

const Map = ({ center, homeMarker: initialHomeMarker }) => {
  const [homeMarker, setHomeMarker] = useState(initialHomeMarker);
  const [map, setMap] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapId = process.env.NEXT_PUBLIC_MAP_ID || "DEMO_MAP_ID";

  // Update homeMarker when the prop changes
  useEffect(() => {
    if (initialHomeMarker) {
      setHomeMarker(initialHomeMarker);
    }
  }, [initialHomeMarker]);

  // Request user's location when the component mounts
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location:", error);
          // Fallback to the initial center prop if permission is denied or an error occurs
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []); // Empty dependency array ensures this runs once on mount

  // Center the map on the user's location when both map and userLocation are available
  useEffect(() => {
    if (map && userLocation) {
      map.panTo(userLocation);
    }
  }, [map, userLocation]);

  // Handle home marker rendering
  useEffect(() => {
    let currentMarker = null;

    const loadGoogleMapsLibraries = async () => {
      if (map && homeMarker) {
        const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");

        if (currentMarker) {
          currentMarker.map = null;
          currentMarker = null;
        }

        const icon = document.createElement("div");
        icon.innerHTML = '<i class="fa fa-home fa-lg"></i>';

        const faPin = new PinElement({
          glyph: icon,
          glyphColor: "#ffffff",
          background: "#007bff",
          borderColor: "#0056b3",
        });

        currentMarker = new AdvancedMarkerElement({
          map,
          position: homeMarker,
          content: faPin.element,
          title: "Home Marker",
        });
      }
    };

    loadGoogleMapsLibraries();

    return () => {
      if (currentMarker) {
        currentMarker.map = null;
        currentMarker = null;
      }
    };
  }, [map, homeMarker]);

  const handleMapLoad = (mapInstance) => {
    setMap(mapInstance);
  };

  return (
    <div style={{ height: '100%', width: '100%', padding: '0', margin: '0' }}>
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center} // Initial center from props
        zoom={12}
        onLoad={handleMapLoad}
        options={{
          mapId: mapId,
          colorScheme: 'LIGHT',
        }}
      >
      </GoogleMap>
    </div>
  );
};

export default Map;