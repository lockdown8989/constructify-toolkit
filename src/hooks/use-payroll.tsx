
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/components/dashboard/salary-table/types';
import { processEmployeePayroll } from './payroll/use-payroll-processing';
import { exportPayrollData } from './payroll/use-payroll-export';

export const usePayroll = (employees: Employee[]) => {
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

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
      
      for (const employeeId of selectedEmployees) {
        try {
          const employee = employees.find(emp => emp.id === employeeId);
          if (!employee) continue;

          await processEmployeePayroll(employeeId, employee);
          successCount++;
        } catch (err) {
          console.error('Error processing payroll:', err);
          failCount++;
        }
      }
      
      setSelectedEmployees(new Set());
      
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
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportPayroll = async () => {
    setIsExporting(true);
    try {
      await exportPayrollData();
      toast({
        title: "Export successful",
        description: "Payslip data has been exported to CSV.",
      });
    } catch (err) {
      console.error("Error exporting payslips:", err);
      toast({
        title: "Export failed",
        description: "An unexpected error occurred while exporting payslip data.",
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
    handleProcessPayroll,
    handleExportPayroll,
  };
};
