
import { useEffect } from 'react';
import { useOwnEmployeeData } from './use-employees';
import { useToast } from './use-toast';

export function useEmployeeDataManagement() {
  const { data: employeeData, isLoading, error } = useOwnEmployeeData();
  
  // We no longer need to display the toast here since it's handled in the useOwnEmployeeData hook
  // This avoids duplicate error messages and handles the error at the appropriate level

  return {
    employeeData,
    isLoading,
    error,
    employeeId: employeeData?.id
  };
}
