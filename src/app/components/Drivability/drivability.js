import React, { useEffect, useState } from 'react';
import styles from './drivability.module.css';
import { POIContext } from '../../context/POIContext.js';

const Drivability = () => {
    const { POIsAndEmojis } = React.useContext(POIContext);
    const [score, setScore] = useState(0);

    useEffect(() => {
        if (POIsAndEmojis && POIsAndEmojis.length > 1){
            const newScore = calculateScore(POIsAndEmojis);
            setScore(newScore);
        } else {
            setScore(0);
        }
    }, [POIsAndEmojis]);

    const calculateScore = (POIsAndEmojis) => {
        // Priority weights (ID : Weight)
        // Higher weight = more impact on the score
        const weights = {
            1: 0.40,  // Work (highest priority)
            2: 0.30,  // Grocery stores
            3: 0.20,  // Parks, schools
            4: 0.10   // Other amenities
        };

        let totalScore = 0.0;
        let totalPossibleWeight = 0.0;  // Track valid POIs' total weight

        for (const poi of POIsAndEmojis) {
            const poiId = poi.id;
            const drivingDuration = poi.drivingDuration;

            // Skip invalid or missing drivingDuration
            if (drivingDuration === null || drivingDuration === undefined || !weights.hasOwnProperty(poiId)) {
                continue;
            }

            // Convert seconds to minutes for scoring
            const drivingMinutes = drivingDuration / 60;

            // Calculate normalized score (0-1)
            let normalized;
            if (drivingMinutes <= 5) {
                normalized = 1.0;
            } else if (drivingMinutes <= 10) {
                normalized = 0.8;
            } else if (drivingMinutes <= 15) {
                normalized = 0.6;
            } else if (drivingMinutes <= 20) {
                normalized = 0.4;
            } else if (drivingMinutes <= 30) {
                normalized = 0.2;
            } else {
                normalized = 0.1;
            }

            // Add to total score
            const weight = weights[poiId];
            totalScore += normalized * weight;
            totalPossibleWeight += weight;
        }

        // Avoid division by zero
        if (totalPossibleWeight === 0) {
            return 0.0;
        }

        // Normalize to 0-10 scale and round to 1 decimal
        const finalScore = (totalScore / totalPossibleWeight) * 10;
        return Math.round(finalScore * 10) / 10;  // Round to 1 decimal (e.g., 7.5)
    };

    return (
        <div className={styles.drivabilityContainer}> 
           <div className={styles.drivabilityTitle}>Score: </div>
           <div>{score.toFixed(1)}/10</div>
        </div>
    );
};

export default Drivability;