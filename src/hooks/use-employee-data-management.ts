
import { useEmployees } from '@/hooks/use-employees';
import { useAuth } from '@/hooks/use-auth';
import { useMemo } from 'react';

export const useEmployeeDataManagement = () => {
  const { data: employees = [], isLoading, error } = useEmployees();
  const { user } = useAuth();

  // Find the current user's employee record with memoization for performance
  const currentEmployee = useMemo(() => {
    if (!user || !employees || employees.length === 0) {
      return null;
    }
    
    return employees.find(emp => emp.user_id === user.id) || null;
  }, [employees, user]);

  return {
    employeeData: currentEmployee,
    employeeId: currentEmployee?.id || null,
    allEmployees: employees,
    isLoading,
    error
  };
};
