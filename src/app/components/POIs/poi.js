import React, { useState, useRef, useEffect, useContext } from 'react';
import { POIContext } from '../../context/POIContext.js';
import styles from './poi.module.css';
import EmojiPicker from '../Emojis/EmojiPicker.js';
import CustomDraggable from '../Draggable/CustomDraggable.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIcons } from '../../utils/icons';

const POI = ({ CurrentAddress, CurrentLocation }) => {
  const [rows, setRows] = useState([{ id: 1, address: '', emoji: { icon: 'faBriefcase', color: '#f08000' }, places: null, selectedPlaceID: null, selectedPlaceLocation: null }]);
  const poiContainerRef = useRef(null);
  const nextId = useRef(2);
  const inputRefs = useRef({});
  const { setEmoji, setCategorySearch, selectedPOI, setSelectedPOI, setPOIsAndEmojis } = useContext(POIContext);
  const [selectedEmoji, setSelectedEmoji] = useState(null);
  const [rowIndex, setRowIndex] = useState(1);
  const [showEmojiPicker, setshowEmojiPicker] = useState(false);

  useEffect(() => {
    console.log('CurrentLocation:', CurrentLocation);
  }, [CurrentLocation]);

  useEffect(() => {
    setPOIsAndEmojis(rows.map(row => ({
      id: row.id,
      emoji: row.emoji,
      location: row.selectedPlaceLocation,
      drivingDistance: row.drivingDistance,
      drivingDuration: row.drivingDuration,
    })));
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
      setRows(rows.map(row => row.id === rowIndex ? { ...row, emoji: selectedEmoji } : row));
    }
  }, [selectedEmoji, rowIndex]);

  const handleEmojiSelect = (emojiIcon, emojiColor) => {
    console.log('Emoji selected:', emojiIcon, emojiColor);
    setSelectedEmoji({ icon: emojiIcon, color: emojiColor });
  };

  const handlePickerVisibilityChange = (visibility) => {
    setshowEmojiPicker(visibility);
  };

  const handleAddressChange = (id, address) => {
    setRows(rows.map(row => row.id === id ? { ...row, address: address || '' } : row));
  };

  const handleDelete = (id) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const handleAddressSelected = (id, address, selectedPlaceID, selectedPlaceLocation, drivingDistance, drivingDuration) => {
    const newRows = rows.map(row => row.id === id ? { ...row, address, selectedPlaceID, selectedPlaceLocation, drivingDistance, drivingDuration } : row);
    console.log('New rows:', newRows);
    if (id === rows[rows.length - 1].id) {
      setRows([...newRows, {
        id: nextId.current++,
        address: '',
        distance: '',
        emoji: { icon: 'faBriefcase', color: '#f08000' },
        places: null,
        selectedPlaceID: null,
        selectedPlaceLocation: null,
        drivingDistance: null,
        drivingDuration: null,
      }]);
    } else {
      setRows(newRows);
    }
  };

  const initializeAutocomplete = (id) => {
    if (inputRefs.current[id]) {
      const autocomplete = new window.google.maps.places.Autocomplete(inputRefs.current[id], {
        fields: ['geometry', 'formatted_address', 'place_id'],
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (place.geometry && place.geometry.location) {
          const location = place.geometry.location;
          const formattedAddress = place.formatted_address || '';
          handleAddressSelected(
            id,
            formattedAddress,
            place.place_id,
            { lat: location.lat(), lng: location.lng() },
            null,
            null
          );
        } else {
          console.error('No geometry found for the selected place.');
        }
      });
    }
  };

  useEffect(() => {
    rows.forEach(row => {
      initializeAutocomplete(row.id);
    });
  }, [rows]);

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
                    setshowEmojiPicker(!showEmojiPicker);
                    setRowIndex(row.id);
                  }}
                >
                  <FontAwesomeIcon icon={faIcons[row.emoji.icon]} color="white" />
                </button>
              </td>
              <td className={styles.colLocation}>
                <div className={styles.inputContainer}>
                  <div className={styles.inputWrapper}>
                    <input
                      type="text"
                      placeholder="Enter address..."
                      value={row.address}
                      onChange={(e) => handleAddressChange(row.id, e.target.value)}
                      ref={(el) => (inputRefs.current[row.id] = el)}
                      className={styles.addressInput}
                    />
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
            <EmojiPicker onEmojiSelect={handleEmojiSelect} pickerVisibility={showEmojiPicker} onVisibilityChange={handlePickerVisibilityChange} />
          </div>
        </CustomDraggable>
      </div>
    </div>
  );
};

export default POI;