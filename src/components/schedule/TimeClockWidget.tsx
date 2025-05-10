
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Coffee, StopCircle, PauseCircle, PlayCircle, Timer } from 'lucide-react';
import { useTimeClock } from '@/hooks/time-clock';
import { formatDuration } from '@/utils/time-utils';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const TimeClockWidget = () => {
  const {
    status,
    handleClockIn,
    handleClockOut,
    handleBreakStart,
    handleBreakEnd,
    elapsedTime,
    breakTime
  } = useTimeClock();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    console.log('TimeClockWidget rendered with status:', status);
    
    // Update current time every second
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, [status]);

  const getButtonConfig = () => {
    if (isLoading) {
      return {
        onClick: () => {},
        variant: "outline",
        icon: <Clock className="h-5 w-5 mr-2" />,
        label: "Loading...",
        color: ""
      };
    }

    switch (status) {
      case 'clocked-out':
        return {
          onClick: handleClockIn,
          variant: "default",
          icon: <PlayCircle className="h-5 w-5 mr-2" />,
          label: "Clock In",
          color: "bg-green-600 hover:bg-green-700"
        };
      case 'clocked-in':
        return {
          onClick: handleClockOut,
          variant: "default",
          icon: <StopCircle className="h-5 w-5 mr-2" />,
          label: "Clock Out",
          color: "bg-red-600 hover:bg-red-700"
        };
      case 'on-break':
        return {
          onClick: handleBreakEnd,
          variant: "default",
          icon: <Timer className="h-5 w-5 mr-2" />,
          label: "End Break",
          color: "bg-blue-600 hover:bg-blue-700"
        };
      default:
        return {
          onClick: () => {},
          variant: "outline",
          icon: <Clock className="h-5 w-5 mr-2" />,
          label: "Loading...",
          color: ""
        };
    }
  };

  const buttonConfig = getButtonConfig();

  return (
    <div>
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200">
        <div className="text-center mb-6">
          <div className="text-4xl font-mono font-bold text-blue-900">
            {format(currentTime, 'hh:mm:ss')}
          </div>
          <div className="text-sm text-blue-700">
            {format(currentTime, 'EEEE, MMMM do, yyyy')}
          </div>
        </div>
        
        <div className="mb-6">
          <div className="flex justify-center items-center">
            <div className="w-28 h-28 rounded-full bg-white shadow-inner border border-gray-100 flex items-center justify-center">
              <div className="text-center">
                <p className="text-2xl font-bold text-gray-800">{formatDuration(elapsedTime)}</p>
                <p className="text-xs text-gray-500">HOURS WORKED</p>
              </div>
            </div>
          </div>
          
          {breakTime > 0 && (
            <div className="mt-4 text-center">
              <span className="text-gray-600 text-sm">Break time: </span>
              <span className="font-mono font-medium">{formatDuration(breakTime)}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-3">
          <Button 
            onClick={buttonConfig.onClick} 
            className={cn("py-6 text-lg", buttonConfig.color)}
            disabled={isLoading}
          >
            {buttonConfig.icon}
            {buttonConfig.label}
          </Button>
          
          {status === 'clocked-in' && (
            <Button 
              onClick={handleBreakStart} 
              variant="outline"
              className="py-5 border-blue-400 text-blue-600 hover:bg-blue-50"
            >
              <Coffee className="h-5 w-5 mr-2" />
              Start Break
            </Button>
          )}
        </div>
        
        <div className="mt-6 text-center">
          <div
            className={cn(
              "py-2 px-4 rounded-full font-medium inline-block",
              status === 'clocked-in' && "bg-green-100 text-green-700",
              status === 'on-break' && "bg-blue-100 text-blue-700",
              status === 'clocked-out' && "bg-gray-100 text-gray-600"
            )}
          >
            {status === 'clocked-in' && "Currently Clocked In"}
            {status === 'on-break' && "Currently On Break"}
            {status === 'clocked-out' && "Not Working"}
          </div>
        </div>
      </Card>
      
      {/* Shift rules information */}
      <div className="bg-white rounded-lg mt-4 p-4 shadow-sm border border-gray-100">
        <h3 className="font-medium mb-2 text-gray-800">Shift Information</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-1.5"></div>
            <span>Standard shift: 8 hours with 1 hour break</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-1.5"></div>
            <span>Overtime must be approved by manager</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-gray-500 mt-1.5"></div>
            <span>Timesheets are automatically generated</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default TimeClockWidget;
