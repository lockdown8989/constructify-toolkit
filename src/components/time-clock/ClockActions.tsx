
import { Button } from '@/components/ui/button';

interface ClockActionsProps {
  selectedEmployee: string | null;
  action: 'in' | 'out' | null;
  selectedEmployeeName: string;
  onClockAction: (action: 'in' | 'out') => void;
}

const ClockActions = ({
  selectedEmployee,
  action,
  selectedEmployeeName,
  onClockAction
}: ClockActionsProps) => {
  return (
    <div className="w-full max-w-lg text-center">
      {selectedEmployee ? (
        <>
          <h3 className="text-xl mb-2 font-semibold">{selectedEmployeeName}</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Button 
              className={`py-6 text-3xl rounded-md ${action === 'in' ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: '#00A896' }}
              onClick={() => onClockAction('in')}
            >
              IN
            </Button>
            <Button 
              className={`py-6 text-3xl rounded-md ${action === 'out' ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: '#E63946' }}
              onClick={() => onClockAction('out')}
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
  );
};

export default ClockActions;
