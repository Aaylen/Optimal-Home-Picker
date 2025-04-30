import React, { useRef, useState } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import styles from './search.module.css';
import POI from '../POIs/poi';
import Drivability from '../Drivability/drivability';

const SearchComponent = ({ onPlaceSelected }) => {
  const autocompleteRef = useRef(null);
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState('');
  const [CurrentAddress, setCurrentAddress] = useState('500 El Camino Real, Santa Clara, CA 95053');
  const [CurrentLocation, setCurrentLocation] = useState({ lat: 37.3496, lng: -121.9390 });

  const handlePlaceChanged = () => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      
      if (place && place.formatted_address) {
        setInputValue(place.formatted_address);
        setCurrentAddress(place.formatted_address);
        
        if (place.geometry && place.geometry.location) {
          const newLocation = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          };
          setCurrentLocation(newLocation);
          onPlaceSelected(newLocation);
        }
      }
    }
  };

  const geocodeAddress = (address) => {
    return new Promise((resolve, reject) => {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const location = results[0].geometry.location;
          resolve(location); 
        } else {
          console.error('Geocode was not successful:', status);
          reject(new Error(`Geocode failed with status: ${status}`));
        }
      });
    });
  };

  let isSimulatedEvent = false; 

  const handleKeyDown = (event) => {
    if (isSimulatedEvent) {
      isSimulatedEvent = false;
      return; 
    }
  
    if (event.key === 'Enter') {
      event.preventDefault();
      if (inputRef.current) {
        // Simulate pressing the Down Arrow key to highlight the first prediction
        const downArrowEvent = new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          keyCode: 40,
          code: 'ArrowDown',
          bubbles: true,
          cancelable: true,
        });
        isSimulatedEvent = true; 
        inputRef.current.dispatchEvent(downArrowEvent);
  
        // Simulate pressing the Enter key to select the highlighted prediction
        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          keyCode: 13,
          code: 'Enter',
          bubbles: true,
          cancelable: true,
        });
        isSimulatedEvent = true; 
        inputRef.current.dispatchEvent(enterEvent);
      }
      const newAddress = event.target.value;
      setInputValue(newAddress);
      setCurrentAddress(newAddress);
      geocodeAddress(newAddress)
        .then((location) => {
          setCurrentLocation({ lat: location.lat(), lng: location.lng() });
          onPlaceSelected({ lat: location.lat(), lng: location.lng() });
        })
        .catch((error) => {
          console.error('Error geocoding address:', error);
        });
    }
  };
  
  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  return (
    <div className={styles.main}>
      <div className={styles.flexContainer}>
        <div className={styles.googleSearchBarArea}>
          <Autocomplete
            onLoad={(ref) => (autocompleteRef.current = ref)}
            onPlaceChanged={handlePlaceChanged}
            options={{
              types: ['address'], // Restrict to addresses only
              fields: ["address_components", "formatted_address", "geometry", "place_id"],
            }}
          >
            <div className={styles.height100}>
              <input
                className={styles.searchBar}
                ref={inputRef}
                type="text"
                placeholder="Enter Address..."
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
              />
            </div>
          </Autocomplete>
        </div>
        <div className={styles.drivabilityContainer}>
          <Drivability />
        </div>
      </div>
      <POI
        CurrentAddress={CurrentAddress}
        CurrentLocation={CurrentLocation}
        // onCategoryResults={handleCategoryResults}
      />
    </div>
  );
};

export default SearchComponent;