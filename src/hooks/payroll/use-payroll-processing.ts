
import { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Employee } from "@/types/employee";

type PayrollProcessingInput = {
  employeeIds: string[];
  processDate?: Date;
};

export const usePayrollProcessing = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const queryClient = useQueryClient();

  // Helper function to safely get numeric values
  const getNumericValue = (value: string | number | undefined | null): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') return parseFloat(value) || 0;
    return 0;
  };

  const calculateSalary = (employee: Employee, workingHours: number = 160, overtimeHours: number = 0) => {
    // Get base values ensuring they are numbers
    const baseSalary = getNumericValue(employee.salary);
    
    // Calculate bonus (simplified example)
    const bonus = 0; // Could be calculated based on performance or other factors
    
    // Calculate deductions (simplified example)
    const deductions = 0; // Could include tax, insurance, etc.
    
    // Calculate overtime pay if hourly rate is available
    let overtimePay = 0;
    const hourlyRate = getNumericValue(employee.hourly_rate || (baseSalary / 160));
    
    if (overtimeHours > 0 && hourlyRate > 0) {
      overtimePay = overtimeHours * hourlyRate * 1.5; // Assuming 1.5x for overtime
    }
    
    // Calculate total salary
    return {
      baseSalary,
      workingHours,
      overtimeHours,
      overtimePay,
      bonus,
      deductions,
      totalPaid: baseSalary + overtimePay + bonus - deductions
    };
  };

  const processPayroll = async ({ employeeIds, processDate = new Date() }: PayrollProcessingInput) => {
    setIsProcessing(true);
    
    try {
      let successCount = 0;
      let failCount = 0;
      
      // Process each employee
      for (const employeeId of employeeIds) {
        try {
          // Get employee details
          const { data: employee } = await supabase
            .from('employees')
            .select('*')
            .eq('id', employeeId)
            .single();
          
          if (!employee) {
            failCount++;
            continue;
          }
          
          // Calculate salary components
          const { 
            baseSalary, workingHours, overtimeHours, 
            overtimePay, bonus, deductions, totalPaid 
          } = calculateSalary(employee);
          
          // Insert into payroll table
          const { error } = await supabase
            .from('payroll')
            .insert({
              employee_id: employeeId,
              base_pay: baseSalary,
              working_hours: workingHours,
              overtime_hours: overtimeHours,
              overtime_pay: overtimePay,
              bonus: bonus,
              deductions: deductions,
              salary_paid: totalPaid,
              payment_date: processDate.toISOString(),
              payment_status: 'Processed',
              processing_date: new Date().toISOString(),
              document_name: `Payslip_${employee.name || employeeId}_${processDate.toISOString().split('T')[0]}`,
            });
          
          if (error) {
            console.error("Error processing payroll for employee:", employeeId, error);
            failCount++;
          } else {
            successCount++;
          }
        } catch (empError) {
          console.error("Error in employee processing:", empError);
          failCount++;
        }
      }
      
      // Create payroll history record
      await supabase
        .from('payroll_history')
        .insert({
          employee_count: employeeIds.length,
          success_count: successCount,
          fail_count: failCount,
          processed_by: (await supabase.auth.getUser()).data.user?.id,
          employee_ids: employeeIds
        });
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['payroll'] });
      queryClient.invalidateQueries({ queryKey: ['payroll-history'] });
      
      return {
        success: true,
        message: `Successfully processed ${successCount} payrolls. Failed: ${failCount}`,
        successCount,
        failCount
      };
    } catch (error) {
      console.error("Error processing payroll:", error);
      return {
        success: false,
        message: `Error processing payroll: ${error}`,
        successCount: 0,
        failCount: employeeIds.length
      };
    } finally {
      setIsProcessing(false);
    }
  };

  const mutation = useMutation({
    mutationFn: processPayroll,
    onSuccess: (result) => {
      toast({
        title: "Payroll Processing Complete",
        description: result.message,
        variant: result.success ? "default" : "destructive"
      });
    },
    onError: (error) => {
      toast({
        title: "Payroll Processing Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  });

  return {
    processPayroll: mutation.mutate,
    isProcessing: isProcessing || mutation.isPending,
    result: mutation.data
  };
};
