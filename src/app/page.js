'use client';
import { useState, useRef } from 'react';
import styles from './page.module.css';
import Map from './components/Map/map';
import SearchComponent from './components/search';
import Divider from './components/Divider/Divider';

export default function Home() {
  const [leftWidth, setLeftWidth] = useState(50);
  const containerRef = useRef(null);

  const handleResize = (newWidth) => {
    const clampedWidth = Math.max(20, Math.min(80, newWidth));
    setLeftWidth(clampedWidth);
  };

  return (
    <main className={styles.container} ref={containerRef}>
      <div style={{ width: `${leftWidth}%` }} className={styles.leftPanel}>
        <SearchComponent />
      </div>
      
      <Divider 
        onResize={handleResize}
        containerRef={containerRef}
      />

      <div style={{ width: `${100 - leftWidth}%` }} className={styles.rightPanel}>
        <Map />
      </div>
    </main>
  );
}