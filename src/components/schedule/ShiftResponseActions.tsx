
import React from 'react';
import { Button } from '@/components/ui/button';
import { Schedule } from '@/types/schedule';
import { useShiftResponse } from '@/hooks/use-shift-response';
import { useToast } from '@/hooks/use-toast';

interface ShiftResponseActionsProps {
  shift: Schedule;
  onStatusChange?: () => void;
}

export const ShiftResponseActions: React.FC<ShiftResponseActionsProps> = ({
  shift,
  onStatusChange
}) => {
  const { respondToShift, isLoading } = useShiftResponse();
  const { toast } = useToast();
  
  const handleAccept = async () => {
    if (!shift.id) return;
    
    const result = await respondToShift(shift.id, 'employee_accepted');
    
    if (result) {
      toast({
        title: "Shift Accepted", 
        description: "You have successfully accepted this shift",
        variant: "success"
      });
      
      if (onStatusChange) {
        onStatusChange();
      }
    }
  };
  
  const handleDecline = async () => {
    if (!shift.id) return;
    
    const result = await respondToShift(shift.id, 'employee_rejected');
    
    if (result) {
      toast({
        title: "Shift Declined", 
        description: "You have successfully declined this shift",
        variant: "warning"
      });
      
      if (onStatusChange) {
        onStatusChange();
      }
    }
  };

  // Only show response buttons for pending shifts
  if (shift.status !== 'pending') {
    return null;
  }
  
  return (
    <div className="flex space-x-2 mt-2">
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleAccept}
        disabled={isLoading}
        className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
      >
        Accept
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={handleDecline}
        disabled={isLoading}
        className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
      >
        Decline
      </Button>
    </div>
  );
};
