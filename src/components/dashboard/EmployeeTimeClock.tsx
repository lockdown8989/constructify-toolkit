
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, Pause, Square, Coffee, Timer } from 'lucide-react';
import { TimeClockStatus } from '@/hooks/time-clock/types';
import { useTimeClock } from '@/hooks/time-clock';
import { formatDuration } from '@/utils/time-utils';
import PinCodeEntry from '@/components/time-clock/PinCodeEntry';

export const EmployeeTimeClock = () => {
  const { 
    status, 
    handleClockIn, 
    handleClockOut, 
    handleBreakStart, 
    handleBreakEnd,
    elapsedTime,
    employeeId
  } = useTimeClock();
  
  const [showPinEntry, setShowPinEntry] = useState(false);
  const [pendingAction, setPendingAction] = useState<'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd' | null>(null);
  
  const getStatusDisplay = (status: TimeClockStatus) => {
    switch (status) {
      case 'clocked-in':
        return 'Working';
      case 'clocked-out':
        return 'Not Working';
      case 'on-break':
        return 'On Break';
      default:
        return 'Unknown';
    }
  };

  const handleAction = (action: 'clockIn' | 'clockOut' | 'breakStart' | 'breakEnd') => {
    setPendingAction(action);
    setShowPinEntry(true);
  };
  
  const handlePinComplete = (pin: string) => {
    if (pin.length !== 4) return;
    
    switch (pendingAction) {
      case 'clockIn':
        handleClockIn();
        break;
      case 'clockOut':
        handleClockOut();
        break;
      case 'breakStart':
        handleBreakStart();
        break;
      case 'breakEnd':
        handleBreakEnd();
        break;
    }
    
    setShowPinEntry(false);
    setPendingAction(null);
  };
  
  const handlePinCancel = () => {
    setShowPinEntry(false);
    setPendingAction(null);
  };

  const getActionButton = () => {
    switch (status) {
      case 'clocked-out':
        return (
          <Button 
            className="w-full bg-green-500 hover:bg-green-600" 
            onClick={() => handleAction('clockIn')}
            size="lg"
          >
            <Play className="mr-2 h-4 w-4" />
            Start Shift
          </Button>
        );
      case 'clocked-in':
        return (
          <div className="grid grid-cols-2 gap-2">
            <Button 
              className="w-full bg-amber-500 hover:bg-amber-600" 
              onClick={() => handleAction('breakStart')}
            >
              <Coffee className="mr-2 h-4 w-4" />
              Take Break
            </Button>
            <Button 
              className="w-full bg-red-500 hover:bg-red-600" 
              onClick={() => handleAction('clockOut')}
            >
              <Square className="mr-2 h-4 w-4" />
              End Shift
            </Button>
          </div>
        );
      case 'on-break':
        return (
          <Button 
            className="w-full bg-green-500 hover:bg-green-600" 
            onClick={() => handleAction('breakEnd')}
          >
            <Timer className="mr-2 h-4 w-4" />
            Resume Work
          </Button>
        );
      default:
        return null;
    }
  };

  const getActionTitle = () => {
    switch (pendingAction) {
      case 'clockIn': 
        return 'Start Shift';
      case 'clockOut': 
        return 'End Shift';
      case 'breakStart': 
        return 'Take Break';
      case 'breakEnd': 
        return 'End Break';
      default:
        return 'Enter PIN';
    }
  };

  const getActionType = (): 'in' | 'out' | 'break' => {
    switch (pendingAction) {
      case 'clockIn':
        return 'in';
      case 'clockOut':
        return 'out';
      case 'breakStart':
      case 'breakEnd':
        return 'break';
      default:
        return 'in';
    }
  };

  return (
    <>
      {showPinEntry && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="max-w-md w-full">
            <PinCodeEntry 
              onComplete={handlePinComplete} 
              onCancel={handlePinCancel}
              title={getActionTitle()}
              action={getActionType()}
            />
          </div>
        </div>
      )}
      
      <Card className="bg-white rounded-3xl p-6 card-shadow">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-medium">Time Clock</h3>
          <div className="flex items-center px-3 py-1 rounded-full bg-gray-100">
            <Clock className="h-4 w-4 mr-1 text-gray-600" />
            <span className="text-sm font-medium text-gray-600">
              {getStatusDisplay(status)}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-center mb-6">
          <div className="text-4xl font-bold mb-2">
            {formatDuration(elapsedTime)}
          </div>
          <div className="text-sm text-gray-500">
            {status === 'clocked-in' ? 'Time Worked Today' : 
             status === 'on-break' ? 'Time Worked (On Break)' : 
             'Ready to Start'}
          </div>
        </div>

        {getActionButton()}
      </Card>
    </>
  );
};

export default EmployeeTimeClock;
