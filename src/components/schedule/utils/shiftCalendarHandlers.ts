
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
    setIsAddEmployeeShiftOpen,
    handleEmployeeAddShift
  } = shiftState;
  
  // Handler for submitting the add shift form
  const handleAddShiftSubmit = (formData: any) => {
    console.log('Submitting add shift form:', formData);
    
    // Validate form data
    if (!formData.title || !formData.start_time || !formData.end_time) {
      console.error("Form validation failed: Missing required fields");
      return;
    }
    
    // Submit the form data to create a new shift
    handleSubmitAddShift(formData);
  };
  
  // Handler for submitting the employee shift form
  const handleEmployeeShiftSubmit = (formData: any) => {
    console.log('Submitting employee shift form:', formData);
    
    // Validate form data
    if (!formData.title || !formData.start_time || !formData.end_time || !formData.employee_id) {
      console.error("Form validation failed: Missing required fields for employee shift");
      return;
    }
    
    handleSubmitEmployeeShift(formData);
  };
  
  // Handler for submitting the swap shift form
  const handleSwapShiftSubmit = (formData: any) => {
    console.log('Submitting swap shift form:', formData);
    handleSubmitSwapShift(formData);
  };
  
  // Handler for closing the add shift dialog
  const handleAddShiftClose = () => {
    console.log('Closing add shift dialog');
    setIsAddShiftOpen(false);
  };
  
  // Handler for closing the employee shift dialog
  const handleEmployeeShiftClose = () => {
    console.log('Closing employee shift dialog');
    setIsAddEmployeeShiftOpen(false);
  };
  
  // Handler for closing the swap shift dialog
  const handleSwapShiftClose = () => {
    console.log('Closing swap shift dialog');
    setIsSwapShiftOpen(false);
  };

  // Pass through the handleEmployeeAddShift function from state
  const handleEmployeeAddShiftLocal = (employeeId: string, date: Date) => {
    console.log(`Adding shift for employee ${employeeId} on date ${format(date, 'yyyy-MM-dd')} (handler)`);
    handleEmployeeAddShift(employeeId, date);
  };
  
  return {
    handleAddShiftSubmit,
    handleEmployeeShiftSubmit,
    handleSwapShiftSubmit,
    handleAddShiftClose,
    handleEmployeeShiftClose,
    handleSwapShiftClose,
    handleEmployeeAddShift: handleEmployeeAddShiftLocal
  };
};
