
import { useEffect } from 'react';
import { useOwnEmployeeData } from './use-employees';
import { useToast } from './use-toast';

export function useEmployeeDataManagement() {
  const { data: employeeData, isLoading, error } = useOwnEmployeeData();
  const { toast } = useToast();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Could not load your employee information",
        variant: "destructive"
      });
    }
  }, [error, toast]);

  return {
    employeeData,
    isLoading,
    error,
    employeeId: employeeData?.id
  };
}
