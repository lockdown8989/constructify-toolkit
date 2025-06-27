
import { useEmployees } from '@/hooks/use-employees';

export const useEmployeeDataManagement = () => {
  const { data: employees = [], isLoading, error } = useEmployees();
  
  console.log('useEmployeeDataManagement - employees:', employees);
  console.log('useEmployeeDataManagement - isLoading:', isLoading);
  console.log('useEmployeeDataManagement - error:', error);

  return {
    employeeData: employees,
    isLoading,
    error
  };
};
