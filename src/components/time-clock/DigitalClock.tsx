
import React, { useState, useEffect } from 'react';

const DigitalClock: React.FC = () => {
  const [time, setTime] = useState(new Date());
  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1366;
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const formatTimeUnit = (unit: number): string => {
    return unit.toString().padStart(2, '0');
  };
  
  const hours = time.getHours();
  const minutes = formatTimeUnit(time.getMinutes());
  const seconds = formatTimeUnit(time.getSeconds());
  const ampm = hours >= 12 ? 'PM' : 'AM';
  const displayHours = formatTimeUnit(hours % 12 || 12);
  
  return (
    <div className={`digital-clock ${isTablet ? 'tablet-clock' : ''} select-none`}>
      {displayHours}:{minutes}
      <span className="text-gray-400">{ampm}</span>
    </div>
  );
};

export default DigitalClock;
