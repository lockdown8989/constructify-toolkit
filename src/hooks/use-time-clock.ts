
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type TimeClockStatus = 'clocked-in' | 'clocked-out' | 'on-break';

export const useTimeClock = () => {
  const [status, setStatus] = useState<TimeClockStatus>('clocked-out');
  const { toast } = useToast();

  const handleClockIn = () => {
    setStatus('clocked-in');
    toast({
      title: "Clocked In",
      description: `You clocked in at ${format(new Date(), 'h:mm a')}`,
    });
  };

  const handleClockOut = () => {
    setStatus('clocked-out');
    toast({
      title: "Clocked Out",
      description: `You clocked out at ${format(new Date(), 'h:mm a')}`,
    });
  };

  return {
    status,
    handleClockIn,
    handleClockOut
  };
};
