import React, { createContext, useState } from "react";

export const POIContext = createContext();

export const POIProvider = ({ children }) => {
    // Initialize categorySearch as null instead of empty array since you're using it as an object
    const [categorySearch, setCategorySearch] = useState(null);
    const [POIsAndEmojis, setPOIsAndEmojis] = useState([]);
    
    // Initialize selectedPOI with a proper structure to match how it's used
    const [selectedPOI, setSelectedPOI] = useState({
        id: null,
        name: null,
        placeId: null
    });
    
    // Initialize emoji with empty string instead of null
    const [emoji, setEmoji] = useState('📍');

    // Wrapper functions to ensure state updates are always properly formatted
    const handleSetCategorySearch = (value) => {
        setCategorySearch(value);
    };

    const handleSetSelectedPOI = (value) => {
        // Ensure we always have the correct structure
        setSelectedPOI({
            id: value?.id ?? null,
            name: value?.name ?? null,
            placeId: value?.placeId ?? null
        });
    };

    const handleSetEmoji = (value) => {
        setEmoji(value || '📍');
    };

    return (
        <POIContext.Provider value={{ 
            categorySearch, 
            setCategorySearch: handleSetCategorySearch,
            selectedPOI, 
            setSelectedPOI: handleSetSelectedPOI,
            emoji, 
            setEmoji: handleSetEmoji,
            POIsAndEmojis,
            setPOIsAndEmojis: setPOIsAndEmojis
            
        }}>
            {children}
        </POIContext.Provider>
    );
};