import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faIconList } from '../../utils/icons'; // Import from icons.js
import styles from './emojiPicker.module.css'; 

function EmojiPicker({ onEmojiSelect, pickerVisibility, onVisibilityChange }) {
  const [isPickerVisible, setIsPickerVisible] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState('#f08000'); // State for background color
  const [selectedEmoji, setSelectedEmoji] = useState('faBriefcase'); // State for selected emoji
  const pickerRef = useRef(null);

  // Sync local visibility state with prop
  useEffect(() => {
    setIsPickerVisible(pickerVisibility);
  }, [pickerVisibility]);

  // Handle clicks outside the picker to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setIsPickerVisible(false);
        onVisibilityChange(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onVisibilityChange]);

  // Handle icon selection
  const handleEmojiSelect = (name) => {
    setSelectedEmoji(name);
    onEmojiSelect(name, backgroundColor); 
    setIsPickerVisible(false);
    onVisibilityChange(false);
  };

  return (
    isPickerVisible && (
      <div
        ref={pickerRef}
        style={{
          width: '200px',
          height: '120px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '10px',
          border: '1px solid #ccc',
          padding: '10px',
          borderRadius: '5px',
          backgroundColor: '#16202B',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)', // Subtle shadow for depth
        }}
      >
        {/* Color Picker Section */}
        <div
          style={{
            gridColumn: 'span 5',
            display: 'flex',
            alignItems: 'center',
            paddingBottom: '10px',
            borderBottom: '1px solid #ccc',
          }}
        >
          <label style={{ color: '#fff', marginRight: '10px' }}>Background Color</label>
          <input
            type="color"
            value={backgroundColor}
            onChange={(e) => {
              setBackgroundColor(e.target.value);
              onEmojiSelect(selectedEmoji, e.target.value);
            }}
            className={styles.colorInput}
            style={{ backgroundColor: backgroundColor }}
          />
        </div>
        
        {/* Emoji Buttons */}
        {faIconList.map(({ name, icon, label }) => (
          <button
            key={name}
            onClick={() => handleEmojiSelect(name)}
            title={label}
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '5px',
              borderRadius: '4px',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#333')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <FontAwesomeIcon icon={icon} style={{ color: '#fff', fontSize: '16px' }} />
          </button>
        ))}
      </div>
    )
  );
}

export default EmojiPicker;