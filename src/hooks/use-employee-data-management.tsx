
import { useEffect } from 'react';
import { useOwnEmployeeData } from './use-employees';
import { useToast } from './use-toast';
import { useAuth } from './use-auth';

export function useEmployeeDataManagement() {
  const { user, isManager } = useAuth();
  const { data: employeeData, isLoading, error } = useOwnEmployeeData();
  const { toast } = useToast();

  useEffect(() => {
    if (error && user) {
      console.log('Employee data error:', error);
      // Only show error toast if user has been logged in for more than 3 seconds
      // This prevents showing error right after login before employee record is created
      const timer = setTimeout(() => {
        if (!employeeData) {
          toast({
            title: "Note",
            description: "Setting up your employee profile. This might take a moment.",
            variant: "default"
          });
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error, toast, user, employeeData]);

  return {
    employeeData,
    isLoading,
    error,
    employeeId: employeeData?.id
  };
}
