
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import PinCodeVerification from './PinCodeVerification';
import ConfirmationDialog from './ConfirmationDialog';
import ShiftCompletionDialog from './ShiftCompletionDialog';
import { useToast } from '@/hooks/use-toast';
import type { EmployeeStatus } from './useClockActions.tsx';

interface ClockActionsProps {
  selectedEmployee: string | null;
  action: 'in' | 'out' | null;
  selectedEmployeeName: string;
  selectedEmployeeAvatar?: string;
  employeeStatus: EmployeeStatus | null;
  onClockAction: (action: 'in' | 'out') => Promise<void>;
  onBreakAction?: (action: 'start' | 'end') => Promise<void>;
  isProcessing?: boolean;
}

const ClockActions = ({
  selectedEmployee,
  action,
  selectedEmployeeName,
  selectedEmployeeAvatar,
  employeeStatus,
  onClockAction,
  onBreakAction,
  isProcessing
}: ClockActionsProps) => {
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isShiftCompletionOpen, setIsShiftCompletionOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'in' | 'out' | 'break' | 'end_break' | null>(null);
  const [localProcessing, setLocalProcessing] = useState(false);
  const { toast } = useToast();

  // Remove localStorage use for tracking status (source of truth is now DB)
  // UI uses employeeStatus directly

  const handleActionClick = (clickAction: 'in' | 'out') => {
    if (!selectedEmployee) {
      toast({
        title: "No Employee Selected",
        description: "Please select an employee first",
        variant: "destructive",
      });
      return;
    }
    
    // Prevent repeating the same action
    if (clickAction === 'in' && employeeStatus?.isClockedIn) {
      toast({
        title: "Already Clocked In",
        description: "Employee is already clocked in.",
        variant: "default",
      });
      return;
    }
    if (clickAction === 'out' && !employeeStatus?.isClockedIn) {
      toast({
        title: "Already Clocked Out",
        description: "Employee is already clocked out.",
        variant: "default",
      });
      return;
    }
    
    // For clock out, show the shift completion dialog if employee is clocked in
    if (clickAction === 'out' && employeeStatus?.isClockedIn) {
      setIsShiftCompletionOpen(true);
      return;
    }
    
    // For clock in or if employee is not clocked in
    setPendingAction(clickAction);
    setIsPinDialogOpen(true);
  };

  const handleBreakClick = () => {
    if (!selectedEmployee) {
      toast({
        title: "No Employee Selected",
        description: "Please select an employee first",
        variant: "destructive",
      });
      return;
    }

    if (employeeStatus?.onBreak) {
      // End break - show dialog asking if they want to finish break or finish shift
      setIsShiftCompletionOpen(true);
    } else if (employeeStatus?.isClockedIn) {
      // Start break
      setPendingAction('break');
      setIsPinDialogOpen(true);
    }
  };

  const handleShiftCompletion = async (actionType: 'finish' | 'break') => {
    if (actionType === 'finish') {
      setPendingAction('out');
    } else {
      if (employeeStatus?.onBreak) {
        // If already on break, end the break
        setPendingAction('end_break');
      } else {
        // Start break
        setPendingAction('break');
      }
    }
    setIsShiftCompletionOpen(false);
    setIsPinDialogOpen(true);
  };

  const handlePinSuccess = () => {
    if (pendingAction) {
      setIsPinDialogOpen(false);
      setIsConfirmationOpen(true);
    }
  };

  const handleConfirmAction = async () => {
    if (!pendingAction || isProcessing || localProcessing) return;

    try {
      setLocalProcessing(true);
      
      if (pendingAction === 'break') {
        if (onBreakAction) {
          await onBreakAction('start');
          toast({
            title: "Break Started",
            description: "Employee has started their break",
            variant: "default",
          });
        }
      } else if (pendingAction === 'end_break') {
        if (onBreakAction) {
          await onBreakAction('end');
          toast({
            title: "Break Ended",
            description: "Employee has ended their break",
            variant: "default",
          });
        }
      } else {
        await onClockAction(pendingAction);
        toast({
          title: pendingAction === 'in' ? "Clocked In" : "Clocked Out",
          description: `Employee has been successfully clocked ${pendingAction}`,
          variant: "default",
        });
      }
      
      setIsConfirmationOpen(false);
    } catch (error) {
      console.error('Error in clock action:', error);
    } finally {
      setLocalProcessing(false);
    }
  };

  // Use DB fields to control button state/labels
  const buttonLabels = {
    in: 'IN',
    out: 'OUT',
    break: employeeStatus?.onBreak 
      ? 'END BREAK' 
      : 'START BREAK'
  };

  // Only enable actions when according to DB status
  const isInDisabled = isProcessing || localProcessing || employeeStatus?.isClockedIn;
  const isOutDisabled = isProcessing || localProcessing || !employeeStatus?.isClockedIn;
  const isBreakDisabled = isProcessing || localProcessing;

  return (
    <>
      <div className="w-full max-w-lg text-center px-4">
        {selectedEmployee ? (
          <>
            <h3 className="text-lg sm:text-xl mb-2 font-semibold break-words">{selectedEmployeeName}</h3>
            
            {/* Status indicator */}
            <div className="mb-4">
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                employeeStatus?.isClockedIn 
                  ? employeeStatus.onBreak 
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {employeeStatus?.isClockedIn 
                  ? employeeStatus.onBreak 
                    ? 'On Break'
                    : 'Clocked In'
                  : 'Clocked Out'}
              </span>
              
              {/* Show DB last action indicator */}
              <div className="mt-2 text-xs text-gray-500">
                Last action: {employeeStatus?.isClockedIn ? "IN" : "OUT"}
              </div>
            </div>
            
            {/* Mobile-friendly button layout */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
              <Button 
                className={`py-6 sm:py-8 text-xl sm:text-3xl rounded-md touch-target min-h-[60px] ${
                  employeeStatus?.isClockedIn ? 'ring-2 ring-emerald-400 ring-offset-2' : ''
                } ${action === 'in' ? 'animate-pulse' : ''} bg-emerald-500 hover:bg-emerald-600`}
                onClick={() => handleActionClick('in')}
                disabled={isInDisabled}
              >
                {(isProcessing || localProcessing) && pendingAction === 'in' ? 'Processing...' : buttonLabels.in}
              </Button>
              <Button 
                className={`py-6 sm:py-8 text-xl sm:text-3xl rounded-md touch-target min-h-[60px] ${
                  employeeStatus && !employeeStatus.isClockedIn ? 'ring-2 ring-red-400 ring-offset-2' : ''
                } ${action === 'out' ? 'animate-pulse' : ''} bg-red-600 hover:bg-red-700`}
                onClick={() => handleActionClick('out')}
                disabled={isOutDisabled}
              >
                {(isProcessing || localProcessing) && (pendingAction === 'out') ? 'Processing...' : buttonLabels.out}
              </Button>
            </div>

            {/* Break button - only show if employee is clocked in */}
            {employeeStatus?.isClockedIn && (
              <Button 
                className={`w-full py-4 sm:py-6 text-lg sm:text-xl rounded-md touch-target min-h-[50px] ${
                  employeeStatus.onBreak 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
                onClick={handleBreakClick}
                disabled={isBreakDisabled}
              >
                {(isProcessing || localProcessing) && (pendingAction === 'break' || pendingAction === 'end_break') 
                  ? 'Processing...' 
                  : buttonLabels.break
                }
              </Button>
            )}

            {/* Break reminder for mobile */}
            {employeeStatus?.onBreak && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="text-yellow-800 text-sm font-medium">
                  ⏰ Break in Progress
                </div>
                <div className="text-yellow-700 text-xs mt-1">
                  Don't forget to end your break when finished
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-gray-400 px-4">
            <h3 className="text-lg sm:text-xl mb-4">No Employee Selected</h3>
            <p className="text-sm sm:text-base">Please select an employee from the list</p>
          </div>
        )}
      </div>

      {/* Enhanced Shift Completion Dialog */}
      <ShiftCompletionDialog
        isOpen={isShiftCompletionOpen}
        onClose={() => setIsShiftCompletionOpen(false)}
        onFinishShift={async () => handleShiftCompletion('finish')}
        onGoOnBreak={async () => handleShiftCompletion('break')}
        onEndBreak={employeeStatus?.onBreak ? async () => handleShiftCompletion('break') : undefined}
        employeeName={selectedEmployeeName}
        employeeAvatar={selectedEmployeeAvatar}
        isSubmitting={localProcessing}
        isOnBreak={employeeStatus?.onBreak}
      />

      {/* PIN Verification Dialog */}
      <PinCodeVerification
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
        onSuccess={handlePinSuccess}
        employeeName={selectedEmployeeName}
        action={pendingAction === 'in' ? 'in' : 'out'}
        employeeId={selectedEmployee || ''}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmAction}
        action={pendingAction === 'in' ? 'in' : 'out'}
        employeeName={selectedEmployeeName}
        employeeAvatar={selectedEmployeeAvatar}
        isSubmitting={isProcessing || localProcessing}
        isManagerAction={true}
      />
    </>
  );
};

export default ClockActions;
