import React from 'react';
import styles from './search.module.css';
const SearchComponent = () => {
    return (
        <div className={styles.main}>
            <input className={styles.searchBar} type="text" placeholder="Enter Address..." />
        </div>
    );
};

export default SearchComponent;