
import { useEffect, useState } from 'react';

interface DigitalClockProps {
  className?: string;
}

const DigitalClock = ({ className = '' }: DigitalClockProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Format time as HH:MM
  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className={`text-[10rem] font-mono leading-none ${className}`}>
      {formattedTime}
    </div>
  );
};

export default DigitalClock;
