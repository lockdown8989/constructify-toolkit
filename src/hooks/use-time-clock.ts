
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

type TimeClockStatus = 'clocked-in' | 'clocked-out' | 'on-break';

export const useTimeClock = () => {
  // Use localStorage to persist clock status between page refreshes
  const [status, setStatus] = useState<TimeClockStatus>(() => {
    const savedStatus = localStorage.getItem('timeClock.status');
    return (savedStatus as TimeClockStatus) || 'clocked-out';
  });
  
  const { toast } = useToast();

  // Save status to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('timeClock.status', status);
  }, [status]);

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

  const handleBreakStart = () => {
    setStatus('on-break');
    toast({
      title: "Break Started",
      description: `Your break started at ${format(new Date(), 'h:mm a')}`,
    });
  };

  const handleBreakEnd = () => {
    setStatus('clocked-in');
    toast({
      title: "Break Ended",
      description: `Your break ended at ${format(new Date(), 'h:mm a')}`,
    });
  };

  return {
    status,
    handleClockIn,
    handleClockOut,
    handleBreakStart,
    handleBreakEnd
  };
};
