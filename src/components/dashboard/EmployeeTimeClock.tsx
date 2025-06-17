
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, Pause, Square } from 'lucide-react';
import { TimeClockStatus } from '@/hooks/time-clock/types';
import { useTimeClock } from '@/hooks/time-clock';
import { formatDuration } from '@/utils/time-utils';
import ShiftCompletionDialog from '@/components/time-clock/ShiftCompletionDialog';
import ConfirmationDialog from '@/components/time-clock/ConfirmationDialog';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';

export const EmployeeTimeClock = () => {
  const { 
    status, 
    handleClockIn, 
    handleClockOut, 
    handleBreakStart, 
    handleBreakEnd,
    elapsedTime
  } = useTimeClock();
  
  const { employeeData } = useEmployeeDataManagement();
  const [showDialog, setShowDialog] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [confirmationAction, setConfirmationAction] = useState<'in' | 'out' | 'break'>('in');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleEndShiftClick = () => {
    setShowDialog(true);
  };

  const handleClockInClick = () => {
    setConfirmationAction('in');
    setShowConfirmation(true);
  };

  const handleBreakClick = () => {
    setConfirmationAction('break');
    setShowConfirmation(true);
  };

  const handleConfirmAction = async () => {
    setIsSubmitting(true);
    try {
      switch (confirmationAction) {
        case 'in':
          await handleClockIn();
          break;
        case 'break':
          await handleBreakStart();
          break;
        default:
          break;
      }
      setShowConfirmation(false);
    } catch (error) {
      console.error('Error in confirmation action:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getActionButton = () => {
    switch (status) {
      case 'clocked-out':
        return (
          <Button 
            className="w-full bg-green-500 hover:bg-green-600" 
            onClick={handleClockInClick}
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
              onClick={handleBreakClick}
            >
              <Pause className="mr-2 h-4 w-4" />
              Take Break
            </Button>
            <Button 
              className="w-full bg-red-500 hover:bg-red-600" 
              onClick={handleEndShiftClick}
            >
              <Square className="mr-2 h-4 w-4" />
              End Shift
            </Button>
          </div>
        );
      case 'on-break':
        return (
          <div className="grid grid-cols-1 gap-2">
            <Button 
              className="w-full bg-green-500 hover:bg-green-600" 
              onClick={handleBreakEnd}
            >
              <Play className="mr-2 h-4 w-4" />
              Resume Work
            </Button>
            <Button 
              className="w-full bg-red-500 hover:bg-red-600" 
              onClick={handleEndShiftClick}
            >
              <Square className="mr-2 h-4 w-4" />
              End Shift
            </Button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
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

      <ShiftCompletionDialog
        isOpen={showDialog}
        onClose={() => setShowDialog(false)}
        onFinishShift={handleClockOut}
        onGoOnBreak={handleBreakStart}
        onEndBreak={handleBreakEnd}
        employeeName={employeeData?.name || 'Employee'}
        employeeAvatar={employeeData?.avatar}
        isOnBreak={status === 'on-break'}
      />

      <ConfirmationDialog
        isOpen={showConfirmation}
        onClose={() => setShowConfirmation(false)}
        onConfirm={handleConfirmAction}
        action={confirmationAction}
        employeeName={employeeData?.name || 'Employee'}
        employeeAvatar={employeeData?.avatar}
        isSubmitting={isSubmitting}
        isManagerAction={false}
      />
    </>
  );
};

export default EmployeeTimeClock;
