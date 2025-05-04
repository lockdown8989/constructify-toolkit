
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
  
  const formattedDate = format(currentTime, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(currentTime, 'h:mm:ss a');
  
  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-500">Current Date & Time</h3>
          <p className="text-xl font-bold mt-1">{formattedTime}</p>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
        <Clock className="h-8 w-8 text-muted-foreground" />
      </div>
    </Card>
  );
};

export default CurrentDateTime;
