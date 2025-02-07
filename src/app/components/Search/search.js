import React, { useRef, useState } from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';
import styles from './search.module.css';
import POI from '../POIs/poi';

const SearchComponent = ({ onPlaceSelected }) => {
  const searchBoxRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [CurrentLocation, setCurrentLocation] = useState({ lat: 37.7749, lng: -122.4194 });

  const onLoad = (ref) => {
    searchBoxRef.current = ref;
  };

  const onPlacesChanged = () => {
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0) {
      const place = places[0];
      const location = place.geometry.location;
      setInputValue(place.formatted_address);
      onPlaceSelected({ lat: location.lat(), lng: location.lng() });
      setCurrentLocation({lat: location.lat(), lng: location.lng()});
    }
  };

  const geocodeAddress = (address) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        const location = results[0].geometry.location;
        setInputValue(results[0].formatted_address);
        setCurrentLocation({lat: location.lat(), lng: location.lng()});
        onPlaceSelected({ lat: location.lat(), lng: location.lng() });
      } else {
        console.error('Geocode was not successful:', status);
      }
    });
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      const places = searchBoxRef.current.getPlaces();
      if (places && places.length > 0) {
        const place = places[0];
        setInputValue(place.formatted_address);
        setCurrentLocation({lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng()});
        onPlaceSelected({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      } else {
        geocodeAddress(inputValue);
      }
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

return (
    <div className={styles.main}>
        <div className={styles.googleSearchBarArea}>
            <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
                <div>
                    <input
                        className={styles.searchBar}
                        type="text"
                        placeholder="Enter Address..."
                        value={inputValue}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                    />
                </div>
            </StandaloneSearchBox>
        </div>
        <POI CurrentLocation={CurrentLocation} />
    </div>
);
};

export default SearchComponent;