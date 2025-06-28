
import { useEmployees } from '@/hooks/use-employees';
import { useAuth } from '@/hooks/use-auth';
import { useMemo } from 'react';

export const useEmployeeDataManagement = () => {
  const { data: employees = [], isLoading, error } = useEmployees();
  const { user } = useAuth();
  
  console.log('useEmployeeDataManagement - employees:', employees);
  console.log('useEmployeeDataManagement - isLoading:', isLoading);
  console.log('useEmployeeDataManagement - error:', error);
  console.log('useEmployeeDataManagement - user:', user);

  // Find the current user's employee record
  const currentEmployee = useMemo(() => {
    if (!user || !employees || employees.length === 0) {
      return null;
    }
    
    return employees.find(emp => emp.user_id === user.id) || null;
  }, [employees, user]);

  console.log('useEmployeeDataManagement - currentEmployee:', currentEmployee);

  return {
    employeeData: currentEmployee,
    employeeId: currentEmployee?.id || null,
    allEmployees: employees,
    isLoading,
    error
  };
};
