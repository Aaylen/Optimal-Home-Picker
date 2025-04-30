import React, { useState, useRef, useEffect, useContext } from 'react';
import { POIContext } from '../../context/POIContext.js';
import styles from './poi.module.css';
import EmojiPicker from '../Emojis/EmojiPicker.js';
import CustomDraggable from '../Draggable/CustomDraggable.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIcons } from '../../utils/icons';
import { Autocomplete } from '@react-google-maps/api';

const POI = ({ CurrentAddress, CurrentLocation }) => {
  const [rows, setRows] = useState([
    {
      id: 1,
      address: '',
      emoji: { icon: 'faBriefcase', color: '#f08000' },
      places: null,
      selectedPlaceID: null,
      selectedPlaceLocation: null,
      drivingDistance: null,
      drivingDuration: null,
    },
  ]);
  const poiContainerRef = useRef(null);
  const nextId = useRef(2);
  const inputRefs = useRef({});
  const autocompleteRefs = useRef({});
  const { setEmoji, setCategorySearch, selectedPOI, setSelectedPOI, setPOIsAndEmojis } = useContext(POIContext);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [rowIndex, setRowIndex] = useState(1);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  useEffect(() => {
    console.log('CurrentLocation:', CurrentLocation);
  }, [CurrentLocation]);

  useEffect(() => {
    console.log("Rows:", rows);
  }, [rows]);

  useEffect(() => {
    setPOIsAndEmojis(
      rows.map((row) => ({
        id: row.id,
        emoji: row.emoji,
        location: row.selectedPlaceLocation,
        drivingDistance: row.drivingDistance,
        drivingDuration: row.drivingDuration,
      }))
    );
  }, [rows]);

  useEffect(() => {
    if (selectedPOI) {
      try {
        handleAddressSelected(
          selectedPOI.id || null,
          selectedPOI.name || '',
          selectedPOI.placeId || null,
          selectedPOI.location || null,
          selectedPOI.drivingDistance || null,
          selectedPOI.drivingDuration || null
        );
      } catch (error) {
        console.error('Error handling selected POI:', error);
      }
    }
  }, [selectedPOI]);

  useEffect(() => {
    if (selectedEmoji) {
      setRows((prevRows) =>
        prevRows.map((row) =>
          row.id === rowIndex ? { ...row, emoji: selectedEmoji } : row
        )
      );
    }
  }, [selectedEmoji, rowIndex]);

  const handleEmojiSelect = (emojiIcon, emojiColor) => {
    console.log('Emoji selected:', emojiIcon, emojiColor);
    setSelectedEmoji({ icon: emojiIcon, color: emojiColor });
  };

  const handlePickerVisibilityChange = (visibility) => {
    setShowEmojiPicker(visibility);
  };

  const handleAddressChange = (id, address) => {
    setRows((prevRows) =>
      prevRows.map((row) =>
        row.id === id ? { ...row, address: address || '' } : row
      )
    );
  };

  const handleDelete = (id) => {
    setRows((prevRows) => prevRows.filter((row) => row.id !== id));
    delete inputRefs.current[id];
    delete autocompleteRefs.current[id];
  };

  const handleAddressSelected = (
    id,
    address,
    selectedPlaceID,
    selectedPlaceLocation,
    drivingDistance,
    drivingDuration
  ) => {
    const newRows = rows.map((row) =>
      row.id === id
        ? { ...row, address, selectedPlaceID, selectedPlaceLocation, drivingDistance, drivingDuration }
        : row
    );
    if (id === rows[rows.length - 1].id) {
      setRows([
        ...newRows,
        {
          id: nextId.current++,
          address: '',
          distance: '',
          emoji: { icon: 'faBriefcase', color: '#f08000' },
          places: null,
          selectedPlaceID: null,
          selectedPlaceLocation: null,
          drivingDistance: null,
          drivingDuration: null,
        },
      ]);
    } else {
      setRows(newRows);
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

  const handleKeyDown = (event, rowId) => {
    if (isSimulatedEvent) {
      isSimulatedEvent = false;
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      const inputElement = inputRefs.current[rowId];
      if (inputElement) {
        const downArrowEvent = new KeyboardEvent('keydown', {
          key: 'ArrowDown',
          keyCode: 40,
          code: 'ArrowDown',
          bubbles: true,
          cancelable: true,
        });
        isSimulatedEvent = true;
        inputElement.dispatchEvent(downArrowEvent);

        const enterEvent = new KeyboardEvent('keydown', {
          key: 'Enter',
          keyCode: 13,
          code: 'Enter',
          bubbles: true,
          cancelable: true,
        });
        isSimulatedEvent = true;
        inputElement.dispatchEvent(enterEvent);
      }

      const newAddress = event.target.value;
      handleAddressChange(rowId, newAddress);
      geocodeAddress(newAddress)
        .then((location) => {
          handleAddressSelected(
            rowId,
            newAddress,
            null,
            { lat: location.lat(), lng: location.lng() },
            null,
            null
          );
        })
        .catch((error) => {
          console.error('Error geocoding address:', error);
        });
    }
  };

  const handlePlaceChanged = (rowId) => {
    const autocomplete = autocompleteRefs.current[rowId];
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place && place.formatted_address) {
        const address = place.formatted_address;
        handleAddressChange(rowId, address);
        if (place.geometry && place.geometry.location) {
          const newLocation = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          handleAddressSelected(
            rowId,
            address,
            place.place_id || null,
            newLocation,
            null,
            null
          );
        }
      }
    }
  };

  return (
    <div className={styles.poiContainer} ref={poiContainerRef}>
      <table className={styles.poiTable}>
        <thead>
          <tr>
            <th className={styles.colEmoji}></th>
            <th className={styles.colLocation}>Location</th>
            <th className={styles.colDistance}>Distance</th>
            <th className={styles.colActions}></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              <td className={styles.colEmoji}>
                <button
                  className={styles.emojiButton}
                  style={{ background: row.emoji.color, height: '25px', width: '30px' }}
                  onClick={() => {
                    setShowEmojiPicker(!showEmojiPicker);
                    setRowIndex(row.id);
                  }}
                >
                  <FontAwesomeIcon icon={faIcons[row.emoji.icon]} color="white" />
                </button>
              </td>
              <td className={styles.colLocation}>
                <div className={styles.inputContainer}>
                  <div className={styles.inputWrapper}>
                    <Autocomplete
                      onLoad={(ref) => (autocompleteRefs.current[row.id] = ref)}
                      onPlaceChanged={() => handlePlaceChanged(row.id)}
                      options={{
                        types: ['address'],
                        fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Enter address..."
                        value={row.address}
                        onChange={(e) => handleAddressChange(row.id, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, row.id)}
                        ref={(el) => (inputRefs.current[row.id] = el)}
                        className={styles.addressInput}
                      />
                    </Autocomplete>
                  </div>
                </div>
              </td>
              <td className={styles.colDistance}>
                {row.drivingDuration && `${Math.round(row.drivingDuration / 60)} Minutes`}
                <br />
                {row.drivingDistance && `${(row.drivingDistance / 1609.34).toFixed(1)} Miles`}
              </td>
              <td className={styles.colActions}>
                <button
                  onClick={() => handleDelete(row.id)}
                  className={styles.deleteButton}
                >
                  ×
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <CustomDraggable>
          <div>
            <EmojiPicker
              onEmojiSelect={handleEmojiSelect}
              pickerVisibility={showEmojiPicker}
              onVisibilityChange={handlePickerVisibilityChange}
            />
          </div>
        </CustomDraggable>
      </div>
    </div>
  );
};

export default POI;