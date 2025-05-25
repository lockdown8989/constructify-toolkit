
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PinCodeVerification from './PinCodeVerification';
import ConfirmationDialog from './ConfirmationDialog';
import ShiftCompletionDialog from './ShiftCompletionDialog';
import { useToast } from '@/hooks/use-toast';
import type { EmployeeStatus } from './useClockActions';

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

  const handleActionClick = (clickAction: 'in' | 'out') => {
    if (!selectedEmployee) {
      toast({
        title: "No Employee Selected",
        description: "Please select an employee first",
        variant: "destructive",
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
      // End break
      setPendingAction('end_break');
      setIsPinDialogOpen(true);
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
      setPendingAction('break');
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

  const getButtonLabel = () => {
    if (!employeeStatus) return { in: 'IN', out: 'OUT' };
    
    if (employeeStatus.isClockedIn) {
      if (employeeStatus.onBreak) {
        return { in: 'IN', out: 'OUT', break: 'END BREAK' };
      } else {
        return { in: 'IN', out: 'OUT', break: 'START BREAK' };
      }
    }
    
    return { in: 'IN', out: 'OUT (Disabled)' };
  };

  const buttonLabels = getButtonLabel();

  // Convert pending action for confirmation dialog
  const getConfirmationAction = (): 'in' | 'out' | 'break' => {
    if (pendingAction === 'end_break') return 'break';
    if (pendingAction === 'break') return 'break';
    return pendingAction as 'in' | 'out';
  };

  const getPinAction = (): 'in' | 'out' | 'break' => {
    if (pendingAction === 'end_break' || pendingAction === 'break') return 'break';
    return pendingAction as 'in' | 'out';
  };

  return (
    <>
      <div className="w-full max-w-lg text-center">
        {selectedEmployee ? (
          <>
            <h3 className="text-xl mb-2 font-semibold">{selectedEmployeeName}</h3>
            
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
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <Button 
                className={`py-8 text-3xl rounded-md ${action === 'in' ? 'animate-pulse' : ''} bg-emerald-500 hover:bg-emerald-600`}
                onClick={() => handleActionClick('in')}
                disabled={isProcessing || localProcessing || employeeStatus?.isClockedIn}
              >
                {(isProcessing || localProcessing) && pendingAction === 'in' ? 'Processing...' : buttonLabels.in}
              </Button>
              <Button 
                className={`py-8 text-3xl rounded-md ${action === 'out' ? 'animate-pulse' : ''} bg-red-600 hover:bg-red-700`}
                onClick={() => handleActionClick('out')}
                disabled={isProcessing || localProcessing || !employeeStatus?.isClockedIn}
              >
                {(isProcessing || localProcessing) && (pendingAction === 'out') ? 'Processing...' : 'OUT'}
              </Button>
            </div>

            {/* Break button - only show if employee is clocked in */}
            {employeeStatus?.isClockedIn && (
              <Button 
                className={`w-full py-6 text-xl rounded-md ${
                  employeeStatus.onBreak 
                    ? 'bg-blue-600 hover:bg-blue-700' 
                    : 'bg-orange-500 hover:bg-orange-600'
                }`}
                onClick={handleBreakClick}
                disabled={isProcessing || localProcessing}
              >
                {(isProcessing || localProcessing) && (pendingAction === 'break' || pendingAction === 'end_break') 
                  ? 'Processing...' 
                  : buttonLabels.break || (employeeStatus.onBreak ? 'END BREAK' : 'START BREAK')
                }
              </Button>
            )}
          </>
        ) : (
          <div className="text-center text-gray-400">
            <h3 className="text-xl mb-4">No Employee Selected</h3>
            <p>Please select an employee from the list</p>
          </div>
        )}
      </div>

      {/* Shift Completion Dialog */}
      <ShiftCompletionDialog
        isOpen={isShiftCompletionOpen}
        onClose={() => setIsShiftCompletionOpen(false)}
        onFinishShift={async () => handleShiftCompletion('finish')}
        onGoOnBreak={async () => handleShiftCompletion('break')}
        employeeName={selectedEmployeeName}
        employeeAvatar={selectedEmployeeAvatar}
        isSubmitting={localProcessing}
      />

      {/* PIN Verification Dialog */}
      <PinCodeVerification
        isOpen={isPinDialogOpen}
        onClose={() => setIsPinDialogOpen(false)}
        onSuccess={handlePinSuccess}
        employeeName={selectedEmployeeName}
        action={getPinAction()}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmAction}
        action={getConfirmationAction()}
        employeeName={selectedEmployeeName}
        employeeAvatar={selectedEmployeeAvatar}
        isSubmitting={isProcessing || localProcessing}
        isManagerAction={true}
      />
    </>
  );
};

export default ClockActions;
