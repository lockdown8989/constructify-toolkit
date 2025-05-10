
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, Coffee, StopCircle, PauseCircle, Timer } from 'lucide-react';
import { useTimeClock } from '@/hooks/time-clock';
import { formatDuration } from '@/utils/time-utils';

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

  useEffect(() => {
    console.log('TimeClockWidget rendered with status:', status);
  }, [status]);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Time Clock
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="text-center mb-4">
          <div className="text-3xl font-mono font-bold">
            {formatDuration(elapsedTime)}
          </div>
          <div className="text-sm text-gray-500">
            Hours Worked
          </div>
          
          {breakTime > 0 && (
            <div className="mt-2 text-sm">
              <span className="text-gray-500">Break time: </span>
              <span className="font-mono">{formatDuration(breakTime)}</span>
            </div>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-2 mb-4">
          {status === 'clocked-out' && (
            <Button 
              onClick={handleClockIn} 
              className="bg-green-600 hover:bg-green-700"
            >
              <Clock className="h-4 w-4 mr-2" />
              Clock In
            </Button>
          )}
          
          {status === 'clocked-in' && (
            <>
              <Button 
                onClick={handleBreakStart} 
                variant="outline"
                className="border-blue-400 text-blue-500 hover:bg-blue-50"
              >
                <Coffee className="h-4 w-4 mr-2" />
                Start Break
              </Button>
              
              <Button 
                onClick={handleClockOut} 
                className="bg-red-600 hover:bg-red-700"
              >
                <StopCircle className="h-4 w-4 mr-2" />
                Clock Out
              </Button>
            </>
          )}
          
          {status === 'on-break' && (
            <Button 
              onClick={handleBreakEnd} 
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Timer className="h-4 w-4 mr-2" />
              End Break
            </Button>
          )}
        </div>
        
        <div className="text-sm text-center text-gray-500">
          {status === 'clocked-in' && (
            <div className="p-2 bg-green-50 text-green-700 rounded-full font-medium">
              Currently Clocked In
            </div>
          )}
          {status === 'on-break' && (
            <div className="p-2 bg-blue-50 text-blue-700 rounded-full font-medium">
              Currently On Break
            </div>
          )}
          {status === 'clocked-out' && (
            <div className="p-2 bg-gray-100 text-gray-600 rounded-full">
              Clocked Out
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeClockWidget;
