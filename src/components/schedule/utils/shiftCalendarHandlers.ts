
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

export const createShiftCalendarHandlers = (shiftState: any) => {
  const {
    handleSubmitAddShift,
    handleSubmitEmployeeShift,
    handleSubmitSwapShift,
    setIsAddShiftOpen,
    setIsSwapShiftOpen,
    setIsAddEmployeeShiftOpen
  } = shiftState;
  
  // Handler for submitting the add shift form
  const handleAddShiftSubmit = (formData: any) => {
    console.log('Submitting add shift form:', formData);
    handleSubmitAddShift(formData);
  };
  
  // Handler for submitting the employee shift form
  const handleEmployeeShiftSubmit = (formData: any) => {
    handleSubmitEmployeeShift(formData);
  };
  
  // Handler for submitting the swap shift form
  const handleSwapShiftSubmit = (formData: any) => {
    handleSubmitSwapShift(formData);
  };
  
  // Handler for closing the add shift dialog
  const handleAddShiftClose = () => {
    setIsAddShiftOpen(false);
  };
  
  // Handler for closing the employee shift dialog
  const handleEmployeeShiftClose = () => {
    setIsAddEmployeeShiftOpen(false);
  };
  
  // Handler for closing the swap shift dialog
  const handleSwapShiftClose = () => {
    setIsSwapShiftOpen(false);
  };
  
  return {
    handleAddShiftSubmit,
    handleEmployeeShiftSubmit,
    handleSwapShiftSubmit,
    handleAddShiftClose,
    handleEmployeeShiftClose,
    handleSwapShiftClose
  };
};
