
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DigitalClockProps {
  className?: string;
}

const DigitalClock: React.FC<DigitalClockProps> = ({ className }) => {
  const [time, setTime] = useState<string>('');
  const [date, setDate] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      
      // Format time as HH:MM:SS
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      
      setTime(`${hours}:${minutes}:${seconds}`);
      
      // Format date
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      };
      setDate(now.toLocaleDateString('en-US', options));
    };

    // Update immediately
    updateTime();
    
    // Then update every second
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center">
      <div className={cn("digital-clock font-mono font-bold", className)}>
        {time}
      </div>
      <div className="text-gray-400 text-sm mt-1">
        {date}
      </div>
    </div>
  );
};

export default DigitalClock;
