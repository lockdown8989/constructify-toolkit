
import { useState } from 'react';

export const useTimeClock = () => {
  const [status, setStatus] = useState<'clocked_out' | 'clocked_in' | 'on_break'>('clocked_out');

  const handleClockIn = () => {
    setStatus('clocked_in');
    console.log('Clocked in');
  };

  const handleClockOut = () => {
    setStatus('clocked_out');
    console.log('Clocked out');
  };

  const handleBreakStart = () => {
    setStatus('on_break');
    console.log('Break started');
  };

  const handleBreakEnd = () => {
    setStatus('clocked_in');
    console.log('Break ended');
  };

  return {
    status,
    handleClockIn,
    handleClockOut,
    handleBreakStart,
    handleBreakEnd,
  };
};
