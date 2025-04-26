
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, X } from 'lucide-react';
import { useOpenShiftResponse } from '@/hooks/use-open-shift-response';
import { OpenShift } from '@/types/restaurant-schedule';
import { useAuth } from '@/hooks/use-auth';

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
  const { user, isManager, isAdmin, isHR } = useAuth();
  
  const hasManagerialAccess = isManager || isAdmin || isHR;
  
  // Allow response if user is the employee being offered the shift
  const canRespond = hasManagerialAccess || user?.id === employeeId;
  
  if (!canRespond) {
    return null;
  }

  const handleResponse = (response: 'confirmed' | 'rejected') => {
    respondToOpenShift.mutate({
      shiftId: shift.id,
      employeeId,
      response
    });
  };

  return (
    <div className={`flex gap-2 ${className}`}>
      <Button
        onClick={() => handleResponse('confirmed')}
        variant="default"
        size="sm"
        className="bg-green-500 hover:bg-green-600"
      >
        <Check className="w-4 h-4 mr-1" />
        Accept
      </Button>
      <Button
        onClick={() => handleResponse('rejected')}
        variant="outline"
        size="sm"
        className="border-red-500 text-red-500 hover:bg-red-50"
      >
        <X className="w-4 h-4 mr-1" />
        Decline
      </Button>
    </div>
  );
};

export default OpenShiftResponseActions;
