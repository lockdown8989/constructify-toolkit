
import { useEmployeeSelection } from './hooks/useEmployeeSelection';
import { useClockInOut } from './hooks/useClockInOut';
import { useBreakManagement } from './hooks/useBreakManagement';

export const useClockActions = () => {
  const {
    selectedEmployee,
    employeeStatus,
    handleSelectEmployee,
    setEmployeeStatus
  } = useEmployeeSelection();

  const {
    action,
    isProcessing: isClockProcessing,
    handleClockAction
  } = useClockInOut(selectedEmployee, employeeStatus, setEmployeeStatus);

  const {
    handleBreakAction,
    isBreakProcessing
  } = useBreakManagement(selectedEmployee, employeeStatus, setEmployeeStatus);

  return {
    selectedEmployee,
    action,
    isProcessing: isClockProcessing || isBreakProcessing,
    employeeStatus,
    handleSelectEmployee,
    handleClockAction,
    handleBreakAction
  };
};

export type { EmployeeStatus } from './hooks/useEmployeeSelection';
