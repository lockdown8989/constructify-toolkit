
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/components/dashboard/salary-table/types';
import { processEmployeePayroll, savePayrollHistory } from './payroll/use-payroll-processing';
import { exportPayrollData } from './payroll/use-payroll-export';
import { useCurrencyPreference } from '@/hooks/use-currency-preference';
import { useAuth } from '@/hooks/use-auth';

export const usePayroll = (employees: Employee[]) => {
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [processingHistory, setProcessingHistory] = useState<any[]>([]);
  const { toast } = useToast();
  const { currency } = useCurrencyPreference();
  const { user } = useAuth();

  const handleSelectEmployee = (id: string) => {
    setSelectedEmployees(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };
  
  const handleSelectAll = () => {
    const allIds = employees.map(emp => emp.id);
    setSelectedEmployees(new Set(allIds));
  };
  
  const handleClearAll = () => {
    setSelectedEmployees(new Set());
  };

  const handleProcessPayroll = async () => {
    if (selectedEmployees.size === 0) {
      toast({
        title: "No employees selected",
        description: "Please select at least one employee to process payslip.",
        variant: "destructive"
      });
      return;
    }
    
    setIsProcessing(true);
    
    try {
      let successCount = 0;
      let failCount = 0;
      const processedEmployeeIds = Array.from(selectedEmployees);
      
      for (const employeeId of processedEmployeeIds) {
        try {
          const employee = employees.find(emp => emp.id === employeeId);
          if (!employee) {
            failCount++;
            console.error(`Employee with ID ${employeeId} not found`);
            continue;
          }

          // Convert dashboard employee type to the expected employee type
          const processableEmployee = {
            id: employee.id,
            name: employee.name,
            job_title: employee.title || '',  // Map title to job_title
            department: employee.department || '',
            site: '',  // Provide default value for site
            salary: typeof employee.salary === 'string' 
              ? parseFloat(employee.salary.replace(/[^\d.]/g, '')) 
              : employee.salary,
            status: employee.status,
            user_id: employee.user_id
          };

          await processEmployeePayroll(employeeId, processableEmployee, 'GBP');
          successCount++;
        } catch (err) {
          console.error('Error processing payroll:', err);
          failCount++;
        }
      }
      
      // Save processing history
      if (user) {
        await savePayrollHistory(
          processedEmployeeIds,
          successCount,
          failCount,
          user.id
        );
      }
      
      if (successCount > 0) {
        toast({
          title: failCount === 0 ? "Payslips processed successfully" : "Payslips partially processed",
          description: `Processed: ${successCount} employees. Failed: ${failCount} employees.`,
          variant: failCount === 0 ? "default" : "destructive"
        });
      } else {
        toast({
          title: "Payslip processing failed",
          description: "Failed to process any payments. Check the logs for more details.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Unexpected error during payroll processing:", error);
      toast({
        title: "Processing failed",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
      // Clear selection after processing regardless of success/failure
      setSelectedEmployees(new Set());
    }
  };

  const handleExportPayroll = async () => {
    setIsExporting(true);
    try {
      await exportPayrollData('GBP');
      toast({
        title: "Export successful",
        description: `Payroll data has been exported to CSV in £.`,
      });
    } catch (err) {
      console.error("Error exporting payrolls:", err);
      // Provide more specific error message based on the error
      let errorMessage = "An unexpected error occurred while exporting payroll data.";
      
      if (err instanceof Error) {
        if (err.message === 'No payroll data available to export') {
          errorMessage = "No payroll data is available to export. Process some payrolls first.";
        } else if (err.message.includes('42703')) {
          errorMessage = "Database column error. Please contact system administrator.";
        } else if (err.message.includes('permission denied')) {
          errorMessage = "You don't have permission to export payroll data.";
        } else if (err.message.includes('network')) {
          errorMessage = "Network error. Please check your connection and try again.";
        } else if (err.message) {
          // Use the actual error message if it's informative
          errorMessage = `Export failed: ${err.message}`;
        }
      }
      
      toast({
        title: "Export failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    selectedEmployees,
    isProcessing,
    isExporting,
    handleSelectEmployee,
    handleSelectAll,
    handleClearAll,
    handleProcessPayroll,
    handleExportPayroll,
  };
};
