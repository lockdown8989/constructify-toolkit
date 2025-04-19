
import React from 'react';
import { Button } from '@/components/ui/button';
import { useShiftResponse } from '@/hooks/use-shift-response';
import { Schedule } from '@/hooks/use-schedules';
import { CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface ShiftResponseActionsProps {
  schedule: Schedule;
  onResponseComplete?: () => void;
}

const ShiftResponseActions: React.FC<ShiftResponseActionsProps> = ({ 
  schedule, 
  onResponseComplete 
}) => {
  const { respondToShift } = useShiftResponse();
  
  const handleResponse = async (response: 'accepted' | 'rejected') => {
    try {
      await respondToShift.mutateAsync({
        scheduleId: schedule.id,
        response
      });
      
      toast.success(
        response === 'accepted' 
          ? 'Shift accepted successfully' 
          : 'Shift rejected successfully'
      );
      
      if (onResponseComplete) {
        onResponseComplete();
      }
    } catch (error) {
      console.error(`Error ${response === 'accepted' ? 'accepting' : 'rejecting'} shift:`, error);
      toast.error(`Failed to ${response === 'accepted' ? 'accept' : 'reject'} shift. Please try again.`);
    }
  };

  return (
    <div className="flex space-x-2 mt-2">
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center text-green-600 border-green-600 hover:bg-green-50"
        onClick={() => handleResponse('accepted')}
        disabled={respondToShift.isPending}
      >
        <CheckCircle className="h-4 w-4 mr-1" />
        Accept
      </Button>
      <Button 
        variant="outline" 
        size="sm"
        className="flex items-center text-red-600 border-red-600 hover:bg-red-50"
        onClick={() => handleResponse('rejected')}
        disabled={respondToShift.isPending}
      >
        <XCircle className="h-4 w-4 mr-1" />
        Reject
      </Button>
    </div>
  );
};

export default ShiftResponseActions;
