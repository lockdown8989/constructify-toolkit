
import { TimeClockStatus } from './types';
import { useClockIn } from './actions/use-clock-in';
import { useClockOut } from './actions/use-clock-out';
import { useBreak } from './actions/use-break';

export const useTimeClockActions = (
  setStatus: (status: TimeClockStatus) => void,
  setCurrentRecord: (record: string | null) => void
) => {
  // Get clock in functionality
  const { handleClockIn } = useClockIn(setStatus, setCurrentRecord);
  
  // Get clock out functionality
  const { handleClockOut } = useClockOut(setStatus, setCurrentRecord);
  
  // Get break management functionality
  const { handleBreakStart, handleBreakEnd } = useBreak(setStatus);

  return {
    handleClockIn,
    handleClockOut,
    handleBreakStart,
    handleBreakEnd
  };
};
