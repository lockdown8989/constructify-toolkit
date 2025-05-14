
import React from 'react';
import { Clock, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { TimeClockStatus } from "@/hooks/time-clock/types";

interface TimeClockControlsProps {
  isClockingEnabled: boolean;
  isCollapsed: boolean;
  status: TimeClockStatus;
  onClockIn: () => void;
  onClockOut: () => void;
  onBreakStart: () => void;
  onBreakEnd: () => void;
}

const TimeClockControls: React.FC<TimeClockControlsProps> = ({
  isClockingEnabled,
  isCollapsed,
  status,
  onClockIn,
  onClockOut,
  onBreakStart,
  onBreakEnd
}) => {
  if (!isClockingEnabled) {
    return null;
  }

  if (isCollapsed) {
    return (
      <div className="flex flex-col items-center gap-2 mt-4">
        {status === 'clocked-out' ? (
          <Button 
            onClick={onClockIn}
            size="icon"
            title="Clock In"
            className="w-10 h-10 bg-green-600 hover:bg-green-700"
          >
            <Clock className="h-5 w-5" />
          </Button>
        ) : status === 'clocked-in' ? (
          <>
            <Button 
              onClick={onBreakStart}
              size="icon"
              title="Start Break"
              variant="outline"
              className="w-10 h-10 border-blue-300"
            >
              <Coffee className="h-5 w-5" />
            </Button>
            <Button 
              onClick={onClockOut}
              size="icon"
              title="Clock Out"
              className="w-10 h-10 bg-red-600 hover:bg-red-700"
            >
              <Clock className="h-5 w-5" />
            </Button>
          </>
        ) : (
          <Button 
            onClick={onBreakEnd}
            size="icon"
            title="End Break"
            className="w-10 h-10 bg-blue-600 hover:bg-blue-700"
          >
            <Clock className="h-5 w-5" />
          </Button>
        )}
        
        <div className="w-full flex justify-center mt-1">
          <div className={cn(
            "w-2 h-2 rounded-full",
            status === 'clocked-in' ? 'bg-green-500' : 
            status === 'on-break' ? 'bg-blue-500' : 
            'bg-gray-500'
          )} />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 my-4">
      {status === 'clocked-out' ? (
        <Button 
          onClick={onClockIn}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Clock className="h-4 w-4 mr-2" />
          Clock In
        </Button>
      ) : status === 'clocked-in' ? (
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={onBreakStart}
            variant="outline"
            className="border-blue-300"
          >
            <Coffee className="h-4 w-4 mr-2" />
            Break
          </Button>
          <Button 
            onClick={onClockOut}
            className="bg-red-600 hover:bg-red-700"
          >
            <Clock className="h-4 w-4 mr-2" />
            Out
          </Button>
        </div>
      ) : (
        <Button 
          onClick={onBreakEnd}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Clock className="h-4 w-4 mr-2" />
          End Break
        </Button>
      )}
      
      <div className="text-center mt-2 text-sm">
        <Badge variant={status === 'clocked-in' ? 'default' : status === 'on-break' ? 'outline' : 'secondary'} 
          className={status === 'clocked-in' ? 'bg-green-100 text-green-800 border border-green-300' : 
                   status === 'on-break' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 
                   'bg-gray-100 text-gray-800 border border-gray-300'}>
          {status === 'clocked-in' ? 'Currently Clocked In' : 
           status === 'on-break' ? 'On Break' : 
           'Clocked Out'}
        </Badge>
      </div>
    </div>
  );
};

export default TimeClockControls;
