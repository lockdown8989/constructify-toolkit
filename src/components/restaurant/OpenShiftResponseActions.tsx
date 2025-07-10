
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, X, Loader2 } from 'lucide-react';
import { useOpenShiftResponse } from '@/hooks/use-open-shift-response';
import { OpenShift } from '@/types/restaurant-schedule';
import { useToast } from '@/hooks/use-toast';

interface OpenShiftResponseActionsProps {
  shift: OpenShift;
  employeeId: string;
  className?: string;
}

const OpenShiftResponseActions = ({
  shift,
  employeeId,
  className
}: OpenShiftResponseActionsProps) => {
  const { respondToOpenShift } = useOpenShiftResponse();
  const { toast } = useToast();
  const [loading, setLoading] = useState<'confirmed' | 'rejected' | null>(null);

  const handleResponse = async (response: 'confirmed' | 'rejected') => {
    try {
      setLoading(response);
      
      await respondToOpenShift.mutateAsync({
        shiftId: shift.id,
        employeeId,
        response
      });
      
      // Toast is already handled in the hook's onSuccess callback
    } catch (error) {
      console.error(`Error ${response === 'confirmed' ? 'accepting' : 'rejecting'} open shift:`, error);
      
      toast({
        title: `Failed to ${response === 'confirmed' ? 'accept' : 'reject'} shift`,
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
        onClick={() => handleResponse('confirmed')}
        variant="outline"
        size="sm"
        className="flex items-center text-green-600 border-green-200 hover:bg-green-50 bg-white"
        disabled={loading !== null}
      >
        {loading === 'confirmed' ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <Check className="w-4 h-4 mr-1" />
        )}
        Accept
      </Button>
      <Button
        onClick={() => handleResponse('rejected')}
        variant="outline"
        size="sm"
        className="flex items-center text-red-600 border-red-200 hover:bg-red-50 bg-white"
        disabled={loading !== null}
      >
        {loading === 'rejected' ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <X className="w-4 h-4 mr-1" />
        )}
        Decline
      </Button>
    </div>
  );
};

export default OpenShiftResponseActions;
