
import React from 'react';
import { Button } from '@/components/ui/button';
import { Clock, Coffee } from 'lucide-react';

interface ClockingControlsProps {
  isClockingEnabled: boolean;
  status: string;
  handleClockIn: () => void;
  handleClockOut: () => void;
  handleBreakStart: () => void;
  handleBreakEnd: () => void;
  onClose: () => void;
}

const ClockingControls: React.FC<ClockingControlsProps> = ({
  isClockingEnabled,
  status,
  handleClockIn,
  handleClockOut,
  handleBreakStart,
  handleBreakEnd,
  onClose
}) => {
  if (!isClockingEnabled) {
    return null;
  }

  const handleAction = (action: () => void) => {
    action();
    onClose();
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-gray-900 mb-2">Time Clock</h3>
      
      {status === 'clocked_out' && (
        <Button
          onClick={() => handleAction(handleClockIn)}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Clock className="mr-2 h-4 w-4" />
          Clock In
        </Button>
      )}
      
      {status === 'clocked_in' && (
        <>
          <Button
            onClick={() => handleAction(handleClockOut)}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            <Clock className="mr-2 h-4 w-4" />
            Clock Out
          </Button>
          <Button
            onClick={() => handleAction(handleBreakStart)}
            variant="outline"
            className="w-full"
          >
            <Coffee className="mr-2 h-4 w-4" />
            Start Break
          </Button>
        </>
      )}
      
      {status === 'on_break' && (
        <Button
          onClick={() => handleAction(handleBreakEnd)}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Coffee className="mr-2 h-4 w-4" />
          End Break
        </Button>
      )}
    </div>
  );
};

export default ClockingControls;
