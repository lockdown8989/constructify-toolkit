
import { ShiftCalendarState } from '../types/calendar-types';

export const createShiftCalendarHandlers = (shiftState: ShiftCalendarState) => {
  const {
    handleSubmitAddShift,
    handleSubmitSwapShift,
    handleSubmitEmployeeShift,
    handleAddEmployeeShift
  } = shiftState;
  
  // Create wrapper functions that properly handle the component prop types
  const handleAddShiftSubmit = () => {
    handleSubmitAddShift({});
  };
  
  const handleSwapShiftSubmit = () => {
    handleSubmitSwapShift({});
  };
  
  const handleEmployeeShiftSubmit = () => {
    handleSubmitEmployeeShift({});
  };
  
  // Wrapper for handleAddEmployeeShift to adapt to expected signature
  const handleEmployeeAddShift = (employeeId: string, date: Date) => {
    handleAddEmployeeShift(date);
  };

  return {
    handleAddShiftSubmit,
    handleSwapShiftSubmit,
    handleEmployeeShiftSubmit,
    handleEmployeeAddShift
  };
};
