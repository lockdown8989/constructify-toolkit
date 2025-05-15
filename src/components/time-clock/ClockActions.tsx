
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PinCodeVerification from './PinCodeVerification';
import ConfirmationDialog from './ConfirmationDialog';

interface ClockActionsProps {
  selectedEmployee: string | null;
  action: 'in' | 'out' | null;
  selectedEmployeeName: string;
  selectedEmployeeAvatar?: string;
  onClockAction: (action: 'in' | 'out') => void;
}

const ClockActions = ({
  selectedEmployee,
  action,
  selectedEmployeeName,
  selectedEmployeeAvatar,
  onClockAction
}: ClockActionsProps) => {
  const [isPinDialogOpen, setIsPinDialogOpen] = useState(false);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<'in' | 'out' | null>(null);

  const handleActionClick = (clickAction: 'in' | 'out') => {
    setPendingAction(clickAction);
    setIsPinDialogOpen(true);
  };

  const handlePinSuccess = () => {
    if (pendingAction) {
      setIsConfirmationOpen(true);
    }
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      onClockAction(pendingAction);
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
                className={`py-6 text-3xl rounded-md ${action === 'in' ? 'animate-pulse' : ''} time-clock-button-in`}
                onClick={() => handleActionClick('in')}
              >
                IN
              </Button>
              <Button 
                className={`py-6 text-3xl rounded-md ${action === 'out' ? 'animate-pulse' : ''} time-clock-button-out`}
                onClick={() => handleActionClick('out')}
              >
                OUT
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
      />
    </>
  );
};

export default ClockActions;
