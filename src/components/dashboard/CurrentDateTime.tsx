
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';
import { Clock } from 'lucide-react';

interface CurrentDateTimeProps {
  className?: string;
}

const CurrentDateTime: React.FC<CurrentDateTimeProps> = ({ className }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update the time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Safely format the date
  const formatSafeDate = (date: Date, formatString: string) => {
    try {
      return format(date, formatString);
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid Date';
    }
  };
  
  const formattedDate = formatSafeDate(currentTime, 'EEEE, MMMM d, yyyy');
  const formattedTime = formatSafeDate(currentTime, 'h:mm:ss a');
  
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground">Current Date & Time</h3>
          <p className="text-xl font-bold mt-1 text-foreground">{formattedTime}</p>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
        <Clock className="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
  );
};

export default CurrentDateTime;
