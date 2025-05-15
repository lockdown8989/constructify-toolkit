
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/types/employee';
import * as employeeSync from '@/services/employee-sync';
import { generatePayslip } from '@/services/employee-sync/payslip-sync';

export const useEmployeeManagement = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const fetchEmployees = async () => {
    const { data, error } = await supabase.from('employees').select('*');
    
    if (error) throw error;
    return data as Employee[];
  };
  
  const updateEmployeeStatus = async (id: string, status: string) => {
    const { error } = await supabase
      .from('employees')
      .update({ status })
      .eq('id', id);
      
    if (error) throw error;
    return { id, status };
  };
  
  const assignShift = async (employeeId: string, shiftId: string) => {
    const { error } = await supabase
      .from('employee_shifts')
      .insert({
        employee_id: employeeId,
        shift_id: shiftId,
        assigned_at: new Date().toISOString()
      });
      
    if (error) throw error;
    return { employeeId, shiftId };
  };
  
  const generateEmployeePayslip = async (employeeId: string) => {
    try {
      const url = await generatePayslip(employeeId);
      
      if (!url) {
        throw new Error("Failed to generate payslip");
      }
      
      return url;
    } catch (error) {
      console.error("Error generating payslip:", error);
      throw error;
    }
  };
  
  // Create React Query hooks
  const useEmployees = () => {
    return useQuery({
      queryKey: ['employees'],
      queryFn: fetchEmployees
    });
  };
  
  const useUpdateStatus = () => {
    return useMutation({
      mutationFn: ({ id, status }: { id: string, status: string }) => 
        updateEmployeeStatus(id, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employees'] });
        toast({
          title: "Status Updated",
          description: "Employee status has been updated."
        });
      },
      onError: (error) => {
        toast({
          title: "Update Failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
      }
    });
  };
  
  const useAssignShift = () => {
    return useMutation({
      mutationFn: ({ employeeId, shiftId }: { employeeId: string, shiftId: string }) =>
        assignShift(employeeId, shiftId),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['employee-shifts'] });
        toast({
          title: "Shift Assigned",
          description: "Shift has been successfully assigned to employee."
        });
      },
      onError: (error) => {
        toast({
          title: "Assignment Failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
      }
    });
  };
  
  const useGeneratePayslip = () => {
    return useMutation({
      mutationFn: (employeeId: string) => generateEmployeePayslip(employeeId),
      onSuccess: () => {
        toast({
          title: "Payslip Generated",
          description: "Employee payslip has been successfully generated."
        });
      },
      onError: (error) => {
        toast({
          title: "Generation Failed",
          description: error instanceof Error ? error.message : "Unknown error occurred",
          variant: "destructive"
        });
      }
    });
  };
  
  return {
    useEmployees,
    useUpdateStatus,
    useAssignShift,
    useGeneratePayslip
  };
};
