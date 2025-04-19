
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Clock, PlayCircle, StopCircle, PauseCircle, Timer } from 'lucide-react';
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
              <PlayCircle className="h-4 w-4 mr-2" />
              Clock In
            </Button>
          )}
          
          {status === 'clocked-in' && (
            <>
              <Button 
                onClick={handleBreakStart} 
                variant="outline"
              >
                <PauseCircle className="h-4 w-4 mr-2" />
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
          {status === 'clocked-in' && 'You are currently clocked in'}
          {status === 'on-break' && 'You are currently on break'}
          {status === 'clocked-out' && 'You are currently clocked out'}
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeClockWidget;
