import React, { useState, useRef, useEffect, useContext } from 'react';
import { StandaloneSearchBox } from '@react-google-maps/api';
import { POIContext } from '../../context/POIContext.js';
import styles from './poi.module.css';

const DEFAULT_COLORS = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];


const POI = ({ CurrentAddress, CurrentLocation }) => {
  const [rows, setRows] = useState([{ id: 1, address: '', distance: '', color: '#FF0000', isCategorySearch: true, places: null, selectedPlaceID: null }]);
  const poiContainerRef = useRef(null);
  const nextId = useRef(2);
  const searchBoxRef = useRef(null);
  const {setCategorySearch} = useContext(POIContext);
  const {selectedPOI} = useContext(POIContext);
  const {setSelectedPOI} = useContext(POIContext);

  useEffect(() => {
    console.log('CurrentLocation:', CurrentLocation);
  }, [CurrentLocation]);

  useEffect(() => {
    console.log("Rows updated: ", rows);
  }, [rows]);

  useEffect(() => {
    if (selectedPOI) {
      handleAddressSelected(selectedPOI.id, selectedPOI.name, selectedPOI.placeId);
      console.log("Selected POI:", selectedPOI);
    }
  }, [selectedPOI]);


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

  const onLoad = (ref) => {
    searchBoxRef.current = ref;
  };

  const onPlacesChanged = (row) => {
    const places = searchBoxRef.current?.getPlaces();
    if (places?.[0]?.formatted_address) {
      handleAddressSelected(row.id, places[0].formatted_address);
    }
  };

  const handleAddressSelected = (id, address, selectedPlaceID) => {
    const newRows = rows.map(row => row.id === id ? { ...row, address, selectedPlaceID } : row);
    if (id === rows[rows.length - 1].id) {
      setRows([...newRows, {
        id: nextId.current++,
        address: '',
        distance: '',
        color: getNextColor(newRows),
        isCategorySearch: true,
        places: null,
        selectedPlaceID: null
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
          const distances = response.rows[0].elements.map((element, index) => ({
            place: places[index],
            distance: element.distance.value,
            duration: element.duration.value,
          }));
  
          distances.sort((a, b) => a.distance - b.distance);
          resolve(distances.map(d => ({
            ...d.place,
            drivingDistance: d.distance,
            drivingDuration: d.duration
          })));
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
        places: 
          sortedPlaces.map(place => ({
          name: place.name,
          address: place.vicinity,
          location: place.geometry.location,
          rating: place.rating,
          userRatingsTotal: place.user_ratings_total,
          placeId: place.place_id,
          drivingDuration: place.drivingDuration,
          drivingDistance: place.drivingDistance
        })),
        id: id
      };

      setCategorySearch(categoryResults);
      rows[id - 1].places = categoryResults; 
      handleAddressSelected(id, "Pick a location on the map");
      
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleSwitchSearchMode = (id) => {
    setRows(rows.map(row => row.id === id ? { ...row, isCategorySearch: !row.isCategorySearch } : row));
    setShowSuggestions(false);
  };

  const handleInputFocus = (id) => {
    const row = rows.find(row => row.id === id);
    if (row && row.places) {
      setCategorySearch(row.places);
      setSelectedPOI({
        id: row.id,
        name: row.places.name,
        placeId: row.selectedPlaceID
    });
    } else {
      setCategorySearch(null);
      setSelectedPOI({
      id: null,
      name: null,
      placeId: null
    });
    }
  };

  return (
    <div className={styles.poiContainer} ref={poiContainerRef}>
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
                {row.isCategorySearch ? (
                  <div className={styles.inputContainer}>
                    <input
                      type="text"
                      placeholder="Enter category..."
                      value={row.address}
                      onChange={(e) => handleAddressChange(row.id, e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleCategorySearch(row.id, row.address)}
                      onFocus={() => handleInputFocus(row.id)}
                      className={styles.addressInput}
                    />
                    <button 
                      onClick={() => handleSwitchSearchMode(row.id)} 
                      className={styles.searchButton}
                      title='Search by Address'
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="white" strokeOpacity="0.45" width="20" height="20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                    </button>
                  </div>

                
                ) : (
                  <div className={styles.inputContainer}>
                    <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={() => onPlacesChanged(row)}>
                      <div className={styles.inputWrapper}>
                        <input
                          type="text"
                          placeholder="Enter address..."
                          value={row.address}
                          onChange={(e) => handleAddressChange(row.id, e.target.value)}
                          className={styles.addressInput}
                        />
                        <button 
                          onClick={() => handleSwitchSearchMode(row.id)} 
                          className={styles.searchButtonAdress}
                          title='Search by Category'
                        >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="black" width="20" height="20">
                        <path strokeWidth={1.5} stroke="white" strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                      </svg>
                        </button>
                      </div>
                    </StandaloneSearchBox>
                  </div>
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