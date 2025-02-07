import React, { useState, useRef, useEffect } from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';
import styles from './poi.module.css';

const DEFAULT_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

const POI = ({CurrentLocation}) => {
  const [rows, setRows] = useState([{ id: 1, address: '', distance: '', color: '#FF0000' }]);
  const poiContainerRef = useRef(null);
  const nextId = useRef(2);
  const searchBoxRefs = useRef({});

  useEffect(() => {
    console.log('CurrentLocation:', CurrentLocation);
  }, [CurrentLocation]);

  // Get the next available color from the DEFAULT_COLORS array
  const getNextColor = (currentRows) => {
    const usedColors = new Set(currentRows.map(row => row.color));
    for (const color of DEFAULT_COLORS) {
      if (!usedColors.has(color)) return color;
    }
    return DEFAULT_COLORS[0];
  };

  // Handle address input change
  const handleAddressChange = (id, address) => {
    setRows(rows.map(row => row.id === id ? { ...row, address } : row));
  };

  // Handle color input change
  const handleColorChange = (id, color) => {
    setRows(rows.map(row => row.id === id ? { ...row, color } : row));
  };

  // Handle row deletion
  const handleDelete = (id) => {
    setRows(rows.filter(row => row.id !== id));
  };

  // Handle address selection from the search box
  const handleAddressSelected = (id, address) => {
    const newRows = rows.map(row => row.id === id ? { ...row, address } : row);
    const isLastRow = id === rows[rows.length - 1].id;

    // Add a new row if the last row is edited
    if (isLastRow) {
      const newRow = {
        id: nextId.current++,
        address: '',
        distance: '',
        color: getNextColor(newRows)
      };
      setRows([...newRows, newRow]);
    } else {
      setRows(newRows);
    }
  };

  return (
    <div className={styles.poiContainer} ref={poiContainerRef}>
        <table className={styles.poiTable}>
          <thead>
            <tr>
              <th className={styles.colDrag}></th>
              <th className={styles.colColor}></th>
              <th className={styles.colLocation}>Location</th>
              <th className={styles.colDistance}>Distance</th>
              <th className={styles.colActions}></th>
            </tr>
          </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className={styles.colColor}>
                    <input
                      type="color"
                      value={row.color}
                      onChange={(e) => handleColorChange(row.id, e.target.value)}
                    />
                  </td>
                  <td className={styles.colLocation}>
                    <StandaloneSearchBox
                      onLoad={(ref) => {
                        searchBoxRefs.current[row.id] = ref;
                        // Apply location bias to restrict searches to a 5km radius around currentLocation
                        ref.setBounds(new window.google.maps.Circle({
                          center: CurrentLocation,
                          radius: 500 // 5km radius
                        }).getBounds());
                        ref.setOptions({ strictBounds: true });
                      }}
                      
                      onPlacesChanged={() => {
                        const places = searchBoxRefs.current[row.id]?.getPlaces();
                        if (places?.[0]?.formatted_address) {
                          handleAddressSelected(row.id, places[0].formatted_address);
                        }
                      }}
                    >
                      <input
                        type="text"
                        placeholder="Enter address..."
                        value={row.address}
                        onChange={(e) => handleAddressChange(row.id, e.target.value)}
                        className={styles.addressInput}
                      />
                    </StandaloneSearchBox>
                  </td>
                  <td className={styles.colDistance}>{row.distance}</td>
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
    </div>
  );
};

export default POI;