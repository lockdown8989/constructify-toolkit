
import { useState } from 'react';
import { Employee } from '@/types/employee';
import { useToast } from '@/hooks/use-toast'; 
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { syncEmployeeData } from '@/services/employee-sync';

export function useEmployeeManagement() {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Function to create or update employee with full synchronization
  const createOrUpdateEmployee = async (employee: Employee, isNewEmployee: boolean = false) => {
    setIsProcessing(true);
    try {
      let result;
      
      if (isNewEmployee) {
        // Create new employee
        const { data, error } = await supabase
          .from('employees')
          .insert(employee)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      } else {
        // Update existing employee
        const { data, error } = await supabase
          .from('employees')
          .update(employee)
          .eq('id', employee.id)
          .select()
          .single();
          
        if (error) throw error;
        result = data;
      }
      
      // Manually trigger sync for immediate feedback (normally this would happen via realtime subscription)
      await syncEmployeeData(result, isNewEmployee);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      
      toast({
        title: isNewEmployee ? "Employee Created" : "Employee Updated",
        description: `${employee.name} has been ${isNewEmployee ? "created" : "updated"} and synchronized across all modules.`,
      });
      
      return { success: true, employee: result };
    } catch (error) {
      console.error('Error managing employee:', error);
      toast({
        title: "Error",
        description: `Failed to ${isNewEmployee ? "create" : "update"} employee. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  };
  
  // Function to handle employee batch operations with synchronization
  const processEmployeeBatch = async (employeeIds: string[], operation: 'sync' | 'recalculate' | 'generate-payslips') => {
    setIsProcessing(true);
    try {
      let successCount = 0;
      let failureCount = 0;
      
      for (const id of employeeIds) {
        try {
          // Get employee data
          const { data: employee, error } = await supabase
            .from('employees')
            .select('*')
            .eq('id', id)
            .single();
            
          if (error) {
            failureCount++;
            continue;
          }
          
          if (operation === 'sync') {
            await syncEmployeeData(employee, false);
          } else if (operation === 'recalculate') {
            // Recalculate salary and attendance
            const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
            await import('@/services/employee-sync/salary-sync').then(module => 
              module.calculateSalary(id, currentMonth)
            );
          } else if (operation === 'generate-payslips') {
            // Generate payslips
            const currentMonth = new Date().toISOString().slice(0, 7) + '-01';
            await import('@/services/employee-sync/payslip-sync').then(module => 
              module.processPayslip(id, currentMonth)
            );
          }
          
          successCount++;
        } catch (error) {
          console.error(`Error processing employee ${id}:`, error);
          failureCount++;
        }
      }
      
      toast({
        title: "Batch Processing Complete",
        description: `Successfully processed ${successCount} employees. Failed: ${failureCount}.`,
        variant: failureCount > 0 ? "destructive" : "default",
      });
      
      return { success: successCount > 0, successCount, failureCount };
    } catch (error) {
      console.error('Error in batch operation:', error);
      toast({
        title: "Batch Operation Failed",
        description: `Failed to process employee batch. ${error instanceof Error ? error.message : ''}`,
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setIsProcessing(false);
    }
  };
  
  return {
    createOrUpdateEmployee,
    processEmployeeBatch,
    isProcessing
  };
}
