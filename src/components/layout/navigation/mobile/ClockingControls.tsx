
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Coffee } from "lucide-react";

interface ClockingControlsProps {
  isClockingEnabled: boolean;
  status: string;
  handleClockIn: () => void;
  handleClockOut: () => void;
  handleBreakStart: () => void;
  handleBreakEnd: () => void;
  onClose: () => void;
}

const ClockingControls = ({ 
  isClockingEnabled, 
  status, 
  handleClockIn, 
  handleClockOut, 
  handleBreakStart, 
  handleBreakEnd,
  onClose
}: ClockingControlsProps) => {
  if (!isClockingEnabled) return null;
  
  return (
    <div className="px-4 mb-4">
      {status === 'clocked-out' ? (
        <Button 
          onClick={() => {
            handleClockIn();
            onClose();
          }}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          <Clock className="h-4 w-4 mr-2" />
          Clock In
        </Button>
      ) : status === 'clocked-in' ? (
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => {
              handleBreakStart();
              onClose();
            }}
            variant="outline"
            className="border-blue-300"
          >
            <Coffee className="h-4 w-4 mr-2" />
            Break
          </Button>
          <Button 
            onClick={() => {
              handleClockOut();
              onClose();
            }}
            className="bg-red-600 hover:bg-red-700"
          >
            <Clock className="h-4 w-4 mr-2" />
            Out
          </Button>
        </div>
      ) : (
        <Button 
          onClick={() => {
            handleBreakEnd();
            onClose();
          }}
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          <Clock className="h-4 w-4 mr-2" />
          End Break
        </Button>
      )}
      
      <div className="text-center mt-2 text-sm">
        <Badge variant={status === 'clocked-in' ? 'default' : status === 'on-break' ? 'outline' : 'secondary'} 
          className={status === 'clocked-in' ? 'bg-green-100 text-green-800 border border-green-300' : 
                   status === 'on-break' ? 'bg-blue-100 text-blue-800 border border-blue-300' : 
                   'bg-gray-100 text-gray-800 border border-gray-300'}>
          {status === 'clocked-in' ? 'Currently Clocked In' : 
           status === 'on-break' ? 'On Break' : 
           'Clocked Out'}
        </Badge>
      </div>
    </div>
  );
};

export default ClockingControls;
