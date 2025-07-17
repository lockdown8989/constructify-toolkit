
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2, Mail } from 'lucide-react';
import { useShiftResponse } from '@/hooks/use-shift-response';
import { Schedule } from '@/hooks/use-schedules';
import { useToast } from '@/hooks/use-toast';

interface ShiftResponseActionsProps {
  schedule: Schedule;
  onResponseComplete?: () => void;
  size?: 'sm' | 'default';
  className?: string;
}

const ShiftResponseActions: React.FC<ShiftResponseActionsProps> = ({
  schedule,
  onResponseComplete,
  size = 'default',
  className = ''
}) => {
  const { respondToShift } = useShiftResponse();
  const { toast } = useToast();
  const [loading, setLoading] = useState<'accepted' | 'rejected' | null>(null);

  const handleResponse = async (response: 'accepted' | 'rejected') => {
    try {
      setLoading(response);
      
      await respondToShift.mutateAsync({
        scheduleId: schedule.id,
        response
      });
      
      toast({
        title: response === 'accepted' ? 'Shift Accepted' : 'Shift Rejected',
        description: `You have ${response} the shift successfully.`,
        variant: response === 'accepted' ? 'default' : 'destructive',
      });
      
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
        onClick={() => handleResponse('accepted')}
        variant="default"
        size={size}
        className="flex items-center bg-green-500 hover:bg-green-600 text-white"
        disabled={loading !== null}
      >
        {loading === 'accepted' ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <Check className="w-4 h-4 mr-1" />
        )}
        accept
      </Button>
      
      <Button
        onClick={() => handleResponse('rejected')}
        variant="outline"
        size={size}
        className="flex items-center border-red-200 text-red-600 hover:bg-red-50"
        disabled={loading !== null}
      >
        {loading === 'rejected' ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <X className="w-4 h-4 mr-1" />
        )}
        reject
      </Button>
      
      <Button
        variant="outline"
        size={size}
        className="flex items-center"
      >
        <Mail className="w-4 h-4" />
      </Button>
    </div>
  );
};

export default ShiftResponseActions;
