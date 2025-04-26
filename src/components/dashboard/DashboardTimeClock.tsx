
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { useTimeClock } from '@/hooks/time-clock';
import { formatDuration } from '@/utils/time-utils';
import { cn } from '@/lib/utils';

const DashboardTimeClock = () => {
  const { 
    status,
    handleClockIn,
    elapsedTime
  } = useTimeClock();

  const isWorking = status === 'clocked-in' || status === 'on-break';

  return (
    <Card className={cn(
      "p-6 space-y-6",
      isWorking ? "bg-gray-50" : "bg-white"
    )}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Time Clock</h2>
        <div className="flex items-center gap-2">
          <div className={cn(
            "w-2 h-2 rounded-full",
            isWorking ? "bg-green-500" : "bg-gray-400"
          )} />
          <span className="text-gray-600">
            {isWorking ? "Working" : "Not Working"}
          </span>
        </div>
      </div>

      <div className="text-center">
        <div className="text-4xl font-mono font-bold mb-2">
          {formatDuration(elapsedTime)}
        </div>
        <p className="text-gray-500">
          {status === 'clocked-out' ? 'Ready to Start' : 'Time Worked Today'}
        </p>
      </div>

      {status === 'clocked-out' && (
        <Button 
          onClick={handleClockIn}
          className="w-full bg-green-500 hover:bg-green-600 text-lg h-14"
        >
          <Play className="w-6 h-6 mr-2" />
          Start Shift
        </Button>
      )}
    </Card>
  );
};

export default DashboardTimeClock;
