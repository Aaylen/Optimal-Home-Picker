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
        console.log(POIsAndEmojis);
        let totalScore = 0;
        let numPOIs = 0;
        const maxMins = 40;  
        const minMins = 2;  
        const upperBound = maxMins * 60; 
        const lowerBound = minMins * 60; 

        POIsAndEmojis.forEach((POI) => {
            if (POI.drivingDuration) {
                numPOIs += 1;
                let duration = POI.drivingDuration; 
        
                let score;
                if (duration < lowerBound) {
                    score = 10;
                } else if (duration > upperBound) {
                    score = 0;
                } else {
                    score = Math.round(10 - ((duration - lowerBound) * 10) / (upperBound - lowerBound));
                }
                totalScore += score;
            }
        });

        if (numPOIs === 0) return 0;
        return Math.round(totalScore / numPOIs);
    };

    return (
        <div className={styles.drivabilityContainer}> 
           <div className={styles.drivabilityTitle}>Score: </div>
           <div>{score.toFixed(1)}/10</div>
        </div>
    );
};

export default Drivability;