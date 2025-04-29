'use client';
import { useState, useRef } from 'react';
import { LoadScript } from '@react-google-maps/api';
import { POIContext } from './context/POIContext';
import styles from './page.module.css';
import Map from './components/Map/map';
import SearchComponent from './components/Search/search';
import Divider from './components/Divider/Divider';

const libraries = ['places', 'marker'];

export default function Home() {
  const [leftWidth, setLeftWidth] = useState(50);
  const containerRef = useRef(null);
  const [center, setCenter] = useState({ lat: 37.7749, lng: -122.4194 }); 
  const [homeMarker, setHomeMarker] = useState(null);
  const [categorySearch, setCategorySearch] = useState([]);
  const [selectedPOI, setSelectedPOI] = useState(null);
  const [emoji, setEmoji] = useState(null);
  const [POIsAndEmojis, setPOIsAndEmojis] = useState([]);

  const handleResize = (newWidth) => {
    const clampedWidth = Math.max(20, Math.min(80, newWidth));
    setLeftWidth(clampedWidth);
  };

  const handlePlaceSelected = (location) => {
    setCenter(location);
    setHomeMarker(location);
  };

  return (
    <POIContext.Provider value={{ emoji, setEmoji, POIsAndEmojis, setPOIsAndEmojis }}>
      <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={libraries}>
        <main className={styles.main} ref={containerRef}>
          <div style={{ width: `${leftWidth}%` }} className={styles.leftPanel}>
            <SearchComponent onPlaceSelected={handlePlaceSelected} /> 
          </div>
          <Divider 
            onResize={handleResize}
            containerRef={containerRef}
          />
          <div style={{ width: `${100 - leftWidth}%` }} className={styles.rightPanel}>
            <Map center={center} homeMarker={homeMarker} />
          </div>
        </main>
      </LoadScript>
    </POIContext.Provider>
  );
}