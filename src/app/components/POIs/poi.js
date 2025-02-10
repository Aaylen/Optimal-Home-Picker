import React, { useState, useRef, useEffect } from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';
import styles from './poi.module.css';

const DEFAULT_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

const POI = ({CurrentAddress, CurrentLocation }) => {
  const [rows, setRows] = useState([{ id: 1, address: '', distance: '', color: '#FF0000' }]);
  const [isCategorySearch, setIsCategorySearch] = useState(false);
  const poiContainerRef = useRef(null);
  const nextId = useRef(2);
  const searchBoxRefs = useRef({});

  useEffect(() => {
    console.log('CurrentLocation:', CurrentLocation);
  }, [CurrentLocation]);

  const getNextColor = (currentRows) => {
    const usedColors = new Set(currentRows.map(row => row.color));
    for (const color of DEFAULT_COLORS) {
      if (!usedColors.has(color)) return color;
    }
    return DEFAULT_COLORS[0];
  };

  const handleAddressChange = (id, address) => {
    setRows(rows.map(row => row.id === id ? { ...row, address } : row));
  };

  const handleColorChange = (id, color) => {
    setRows(rows.map(row => row.id === id ? { ...row, color } : row));
  };

  const handleDelete = (id) => {
    setRows(rows.filter(row => row.id !== id));
  };

  const handleAddressSelected = (id, address) => {
    const newRows = rows.map(row => row.id === id ? { ...row, address } : row);
    if (id === rows[rows.length - 1].id && !isCategorySearch) {
      setRows([...newRows, {
        id: nextId.current++,
        address: '',
        distance: '',
        color: getNextColor(newRows)
      }]);
    } else {
      setRows(newRows);
    }
  };

  async function sortByDrivingDistance(places, userLocation) {
    return new Promise((resolve, reject) => {
      const distanceService = new google.maps.DistanceMatrixService();
      
      const destinations = places.map(place => place.geometry.location);
  
      const request = {
        origins: [userLocation], 
        destinations: destinations,
        travelMode: google.maps.TravelMode.DRIVING,
      };
  
      distanceService.getDistanceMatrix(request, (response, status) => {
        if (status === google.maps.DistanceMatrixStatus.OK) {
          // Extract distances and pair with places
          const distances = response.rows[0].elements.map((element, index) => ({
            place: places[index],
            distance: element.distance.value, // Distance in meters
          }));
  
          // Sort places by actual driving distance
          distances.sort((a, b) => a.distance - b.distance);
          resolve(distances.map(d => d.place));
        } else {
          reject("Distance Matrix API failed: " + status);
        }
      });
    });
  }

  const handleCategorySearch = async (id, category) => {
    if (!CurrentAddress || !category.trim()) return;

    try {
      // Create Places Service
      const service = new window.google.maps.places.PlacesService(document.createElement('div'));

      // Search for places
      const placesResults = await new Promise((resolve, reject) => {
        service.nearbySearch({
          location: CurrentLocation,
          rankBy: google.maps.places.RankBy.DISTANCE,
          keyword: category,
        }, (results, status) => {
          if (status === window.google.maps.places.PlacesServiceStatus.OK) {
            resolve(results);
          } else {
            reject(new Error(`Places search failed: ${status}`));
          }
        });
      });

      // Sort by actual driving distance
      const sortedPlaces = await sortByDrivingDistance(placesResults, CurrentLocation);

      // Store results in object
      const categoryResults = {
        category,
        timestamp: new Date().toISOString(),
        origin: CurrentAddress,
        places: sortedPlaces
      };

      console.log('Category search results:', categoryResults);
      
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <div className={styles.poiContainer} ref={poiContainerRef}>
      <div className={styles.searchToggle}>
        <label>
          <input
            type="checkbox"
            checked={isCategorySearch}
            onChange={() => setIsCategorySearch(!isCategorySearch)}
          />
          Category Search
        </label>
      </div>

      <table className={styles.poiTable}>
        <thead>
          <tr>
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
                {isCategorySearch ? (
                  <input
                    type="text"
                    placeholder="Enter category..."
                    value={row.address}
                    onChange={(e) => handleAddressChange(row.id, e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCategorySearch(row.id, row.address)}
                    className={styles.addressInput}
                  />
                ) : (
                  <StandaloneSearchBox
                    onLoad={(ref) => {
                      searchBoxRefs.current[row.id] = ref;
                      ref.setBounds(new window.google.maps.Circle({
                        center: CurrentLocation,
                        radius: 1
                      }).getBounds());
                      ref.setOptions({ 
                        strictBounds: true,
                        types: ['address']
                      });
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
                )}
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