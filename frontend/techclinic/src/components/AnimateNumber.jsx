import React from 'react'
import { useState, useEffect } from 'react'

const AnimateNumber = ({ value, duration = 200}) => {
    const [display, setDisplay] = useState(0);
    useEffect(() => {
      const startTime = performance.now();
      const animate = (time) => {
        const progress = Math.min((time - startTime) / duration, 1);
        const current = Math.floor(progress * value );
        setDisplay(current);
        
        if (progress < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    }, [value, duration])
 
    return display
}

export default AnimateNumber
