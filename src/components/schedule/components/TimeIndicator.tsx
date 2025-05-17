
import React, { useEffect, useState } from 'react';

interface TimeIndicatorProps {
  showOnlyDuringWorkHours?: boolean;
}

const TimeIndicator: React.FC<TimeIndicatorProps> = ({ showOnlyDuringWorkHours = true }) => {
  const [currentTimeTop, setCurrentTimeTop] = useState<number>(-1);

  // Calculate current time position for the indicator
  useEffect(() => {
    const calculateTimePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Only show time indicator during work hours (9am-5pm) if requested
      if (!showOnlyDuringWorkHours || (hours >= 9 && hours <= 17)) {
        const timePosition = (hours - 9) * 60 + minutes;
        setCurrentTimeTop(timePosition);
      } else {
        setCurrentTimeTop(-1); // Hide indicator outside work hours
      }
    };

    calculateTimePosition();
    const interval = setInterval(calculateTimePosition, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [showOnlyDuringWorkHours]);

  if (currentTimeTop < 0) return null;

  return (
    <div 
      className="absolute left-0 right-0 z-10 border-t border-red-400" 
      style={{ top: `${currentTimeTop}px` }}
    >
      <div className="absolute -left-1 -top-2 h-4 w-4 rounded-full bg-red-500" />
    </div>
  );
};

export default TimeIndicator;
