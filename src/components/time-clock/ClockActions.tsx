
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import PinCodeVerification from './PinCodeVerification';
import ConfirmationDialog from './ConfirmationDialog';
import { useToast } from '@/hooks/use-toast';

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
    
    setPendingAction(clickAction);
    setIsPinDialogOpen(true);
  };

  const handlePinSuccess = () => {
    if (pendingAction) {
      setIsPinDialogOpen(false);
      setIsConfirmationOpen(true);
    }
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      try {
        onClockAction(pendingAction);
        setIsConfirmationOpen(false);
      } catch (error) {
        console.error('Error in clock action:', error);
        toast({
          title: "Error",
          description: "There was an error processing the clock action",
          variant: "destructive",
        });
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
              >
                IN
              </Button>
              <Button 
                className={`py-8 text-3xl rounded-md ${action === 'out' ? 'animate-pulse' : ''} bg-red-600 hover:bg-red-700`}
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
