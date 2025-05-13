
import { useEffect } from 'react';
import { useOwnEmployeeData } from './use-employees';
import { useToast } from './use-toast';

export function useEmployeeDataManagement() {
  const { data: employeeData, isLoading, error } = useOwnEmployeeData();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      console.error("Employee data loading error:", error);
      toast({
        title: "Error",
        description: "Could not load your employee information. Please try again later.",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  // Return a consistent object structure even if data is missing
  return {
    employeeData: employeeData || null,
    isLoading,
    error,
    employeeId: employeeData?.id || null
  };
}
