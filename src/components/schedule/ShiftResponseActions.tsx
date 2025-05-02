
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useShiftResponse } from '@/hooks/use-shift-response';
import { Schedule } from '@/hooks/use-schedules';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShiftResponseActionsProps {
  schedule: Schedule;
  onResponseComplete?: () => void;
  size?: 'sm' | 'default';
  variant?: 'outline' | 'default';
  className?: string;
}

const ShiftResponseActions: React.FC<ShiftResponseActionsProps> = ({ 
  schedule, 
  onResponseComplete,
  size = 'sm',
  variant = 'outline', 
  className = ''
}) => {
  const { respondToShift } = useShiftResponse();
  const [loading, setLoading] = useState<'accepted' | 'rejected' | null>(null);
  
  const handleResponse = async (response: 'accepted' | 'rejected') => {
    try {
      setLoading(response);
      console.log(`Responding to shift ${schedule.id} with: ${response}`);
      
      await respondToShift.mutateAsync({
        scheduleId: schedule.id,
        response
      });
      
      toast({
        title: response === 'accepted' ? 'Shift accepted' : 'Shift rejected',
        description: response === 'accepted' 
          ? 'You have successfully accepted this shift. Managers have been notified.' 
          : 'You have successfully rejected this shift. Managers have been notified.',
      });
      
      // Call the callback after successful response
      if (onResponseComplete) {
        onResponseComplete();
      }
    } catch (error) {
      console.error(`Error ${response === 'accepted' ? 'accepting' : 'rejecting'} shift:`, error);
      toast({
        title: `Failed to ${response === 'accepted' ? 'accept' : 'reject'} shift`,
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className={`flex space-x-2 ${className}`}>
      <Button 
        variant={variant}
        size={size}
        className="flex items-center text-green-600 border-green-200 hover:bg-green-50"
        onClick={() => handleResponse('accepted')}
        disabled={respondToShift.isPending || loading !== null}
      >
        {loading === 'accepted' ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <CheckCircle className="h-4 w-4 mr-1" />
        )}
        Accept
      </Button>
      <Button 
        variant={variant}
        size={size}
        className="flex items-center text-red-600 border-red-200 hover:bg-red-50"
        onClick={() => handleResponse('rejected')}
        disabled={respondToShift.isPending || loading !== null}
      >
        {loading === 'rejected' ? (
          <Loader2 className="h-4 w-4 mr-1 animate-spin" />
        ) : (
          <XCircle className="h-4 w-4 mr-1" />
        )}
        Reject
      </Button>
    </div>
  );
};

export default ShiftResponseActions;
