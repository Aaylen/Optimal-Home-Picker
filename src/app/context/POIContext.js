import React, { createContext, useState } from "react";

// Create the context
export const POIContext = createContext();

// Context Provider component
export const POIProvider = ({ children }) => {
    const [categorySearch, setCategorySearch] = useState([]);
    const [selectedPOI, setSelectedPOI] = useState(null);

    return (
        <POIContext.Provider value={{ categorySearch, setCategorySearch, selectedPOI, setSelectedPOI }}>
            {children}
        </POIContext.Provider>
    );
};
