
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
  // Determine if we're on a tablet
  const isTablet = window.innerWidth >= 768 && window.innerWidth <= 1366;
  
  // Adjust button sizes for tablets
  const buttonClasses = isTablet 
    ? "py-8 text-4xl rounded-lg font-bold shadow-lg transition-transform active:scale-95" 
    : "py-6 text-3xl rounded-md";

  return (
    <div className={`w-full ${isTablet ? 'max-w-xl' : 'max-w-lg'} text-center`}>
      {selectedEmployee ? (
        <>
          <h3 className={`${isTablet ? 'text-2xl mb-4' : 'text-xl mb-2'} font-semibold`}>
            {selectedEmployeeName}
          </h3>
          
          <div className="grid grid-cols-2 gap-6">
            <Button 
              className={`${buttonClasses} ${action === 'in' ? 'animate-pulse' : ''} time-clock-button-in`}
              onClick={() => onClockAction('in')}
            >
              IN
            </Button>
            <Button 
              className={`${buttonClasses} ${action === 'out' ? 'animate-pulse' : ''} time-clock-button-out`}
              onClick={() => onClockAction('out')}
            >
              OUT
            </Button>
          </div>
        </>
      ) : (
        <div className="text-center text-gray-400">
          <h3 className={`${isTablet ? 'text-2xl' : 'text-xl'} mb-4`}>No Employee Selected</h3>
          <p className={isTablet ? 'text-lg' : ''}>Please select an employee from the list</p>
        </div>
      )}
    </div>
  );
};

export default ClockActions;
