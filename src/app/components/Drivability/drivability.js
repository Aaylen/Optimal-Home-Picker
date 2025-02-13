import React from 'react';
import styles from './drivability.module.css';

const Drivability = () => {
    return (
        <div className={styles.drivabilityContainer}> 
           <div className={styles.drivabilityTitle}>Score: </div>
           <div>0/10</div>
        </div>
    );
};

export default Drivability;