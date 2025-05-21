
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
    <div className={`${className}`}>
      <Button
        onClick={() => handleResponse('confirmed')}
        variant="default"
        size="sm"
        className="bg-green-500 hover:bg-green-600 text-white rounded-full px-5"
        disabled={loading !== null}
      >
        {loading === 'confirmed' ? (
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
        ) : (
          <Check className="w-4 h-4 mr-1" />
        )}
        accept
      </Button>
    </div>
  );
};

export default OpenShiftResponseActions;
