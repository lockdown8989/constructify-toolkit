
import { Button } from "@/components/ui/button"
import { Clock, Coffee } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useTimeClock } from "@/hooks/time-clock"

interface TimeClockProps {
  onAction: () => void;
}

export const TimeClock = ({ onAction }: TimeClockProps) => {
  const { status, handleClockIn, handleClockOut, handleBreakStart, handleBreakEnd } = useTimeClock();
  
  if (!status) return null;
  
  return (
    <div className="px-4 mb-4">
      {status === 'clocked-out' ? (
        <Button 
          onClick={() => {
            handleClockIn();
            onAction();
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
              onAction();
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
              onAction();
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
            onAction();
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
