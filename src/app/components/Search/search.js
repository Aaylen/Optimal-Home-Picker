import React, { useRef, useState } from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';
import styles from './search.module.css';
import POI from '../POIs/poi';
import Drivability from '../Drivability/drivability';

const SearchComponent = ({ onPlaceSelected }) => {
  const searchBoxRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [CurrentAddress, setCurrentAddress] = useState('500 El Camino Real, Santa Clara, CA 95053');
  const [CurrentLocation, setCurrentLocation] = useState({ lat: 37.3496, lng: -121.9390 });
  const [categoryResults, setCategoryResults] = useState([]);

  const handleCategoryResults = (results) => {
    setCategoryResults(results);
  };

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
      setCurrentAddress(place.formatted_address);
      setCurrentLocation({ lat: location.lat(), lng: location.lng() });
    }
  };

  const geocodeAddress = (address) => {
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results && results.length > 0) {
        const location = results[0].geometry.location;
        setInputValue(results[0].formatted_address);
        setCurrentAddress(results[0].formatted_address);
        setCurrentLocation({ lat: location.lat(), lng: location.lng() });
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
        setCurrentAddress(place.formatted_address);
        setCurrentLocation({ lat: place.geometry.location.lat(), lng: place.geometry.location.lng() });
        onPlaceSelected({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        });
      } else {
        // Fetch Autocomplete predictions to select the first one
        const autocompleteService = new window.google.maps.places.AutocompleteService();
        autocompleteService.getPlacePredictions({ input: inputValue }, (predictions, status) => {
          if (status === 'OK' && predictions && predictions.length > 0) {
            const placesService = new window.google.maps.places.PlacesService(document.createElement('div'));
            placesService.getDetails({ placeId: predictions[0].place_id }, (place, status) => {
              if (status === 'OK') {
                const location = place.geometry.location;
                setInputValue(place.formatted_address);
                setCurrentAddress(place.formatted_address);
                setCurrentLocation({ lat: location.lat(), lng: location.lng() });
                onPlaceSelected({ lat: location.lat(), lng: location.lng() });
              } else {
                geocodeAddress(inputValue);
              }
            });
          } else {
            geocodeAddress(inputValue);
          }
        });
      }
    } else if (event.key === 'Tab') {
      event.preventDefault();
      // Simulate Arrow Down key press to navigate suggestions
      const arrowDownEvent = new KeyboardEvent('keydown', {
        key: 'ArrowDown',
        code: 'ArrowDown',
        keyCode: 40,
        bubbles: true,
      });
      event.target.dispatchEvent(arrowDownEvent);
    }
  };

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div className={styles.main}>
      <div className={styles.flexContainer}>
          <div className={styles.googleSearchBarArea}>
              <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
                  <div className={styles.height100}> 
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
          <div className={styles.drivabilityContainer}>
              <Drivability/>
          </div>
      </div>

      <POI
        CurrentAddress={CurrentAddress}
        CurrentLocation={CurrentLocation}
        onCategoryResults={handleCategoryResults}
      />
    </div>
  );
};

export default SearchComponent;