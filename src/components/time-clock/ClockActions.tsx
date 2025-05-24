
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PinCodeVerification from './PinCodeVerification';
import ConfirmationDialog from './ConfirmationDialog';
import ShiftCompletionDialog from './ShiftCompletionDialog';
import { useToast } from '@/hooks/use-toast';

interface ClockActionsProps {
  selectedEmployee: string | null;
  action: 'in' | 'out' | null;
  selectedEmployeeName: string;
  selectedEmployeeAvatar?: string;
  onClockAction: (action: 'in' | 'out') => Promise<void>;
  onBreakAction?: (action: 'start' | 'end') => Promise<void>;
  isProcessing?: boolean;
}

const ClockActions = ({
  selectedEmployee,
  action,
  selectedEmployeeName,
  selectedEmployeeAvatar,
  onClockAction,
  onBreakAction,
  isProcessing
}: ClockActionsProps) => {
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isShiftCompletionOpen, setIsShiftCompletionOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'in' | 'out' | 'break' | null>(null);
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
    
    // For clock out, show the shift completion dialog instead of going straight to PIN
    if (clickAction === 'out') {
      setIsShiftCompletionOpen(true);
      return;
    }
    
    setPendingAction(clickAction);
    setIsPinDialogOpen(true);
  };

  const handleShiftCompletion = (actionType: 'finish' | 'break') => {
    setPendingAction(actionType === 'finish' ? 'out' : 'break');
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
    if (pendingAction && !isProcessing && !localProcessing) {
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
    }
  };

  return (
    <>
      <div className="w-full max-w-lg text-center">
        {selectedEmployee ? (
          <>
            <h3 className="text-xl mb-2 font-semibold">{selectedEmployeeName}</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Button 
                className={`py-8 text-3xl rounded-md ${action === 'in' ? 'animate-pulse' : ''} bg-emerald-500 hover:bg-emerald-600`}
                onClick={() => handleActionClick('in')}
                disabled={isProcessing || localProcessing}
              >
                {(isProcessing || localProcessing) && pendingAction === 'in' ? 'Processing...' : 'IN'}
              </Button>
              <Button 
                className={`py-8 text-3xl rounded-md ${action === 'out' ? 'animate-pulse' : ''} bg-red-600 hover:bg-red-700`}
                onClick={() => handleActionClick('out')}
                disabled={isProcessing || localProcessing}
              >
                {(isProcessing || localProcessing) && (pendingAction === 'out' || pendingAction === 'break') ? 'Processing...' : 'OUT'}
              </Button>
            </div>
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
        onFinishShift={() => handleShiftCompletion('finish')}
        onGoOnBreak={() => handleShiftCompletion('break')}
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
        action={pendingAction || 'in'}
      />

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirmAction}
        action={pendingAction || 'in'}
        employeeName={selectedEmployeeName}
        employeeAvatar={selectedEmployeeAvatar}
        isSubmitting={isProcessing || localProcessing}
        isManagerAction={true}
      />
    </>
  );
};

export default ClockActions;
