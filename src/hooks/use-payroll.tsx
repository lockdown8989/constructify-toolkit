
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '@/components/dashboard/salary-table/types';
import { exportToCSV } from '@/utils/exports'; // Fixed import path
import { supabase } from '@/integrations/supabase/client';

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

  const calculateSalaryWithGPT = async (employeeId: string, baseSalary: number) => {
    try {
      const { data, error } = await supabase.functions.invoke('calculate-salary', {
        body: { employeeId, baseSalary }
      });

      if (error) throw error;
      return data.finalSalary;
    } catch (err) {
      console.error('Error in calculateSalaryWithGPT:', err);
      return baseSalary * 0.75; // Fallback calculation
    }
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

          const baseSalary = parseInt(employee.salary.replace(/\$|,/g, ''), 10);
          const finalSalary = await calculateSalaryWithGPT(employeeId, baseSalary);

          const { error: payrollError } = await supabase
            .from('payroll')
            .insert({
              employee_id: employeeId,
              salary_paid: finalSalary,
              payment_status: 'Paid',
              payment_date: new Date().toISOString().split('T')[0]
            });

          if (payrollError) throw payrollError;
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
      const { data, error } = await supabase
        .from("payroll")
        .select(`
          id,
          salary_paid,
          payment_status,
          payment_date,
          employee_id,
          employees(name, job_title)
        `);

      if (error) throw error;

      if (!data || data.length === 0) {
        toast({
          title: "No data to export",
          description: "There is no payslip data available for export.",
          variant: "destructive"
        });
        return;
      }

      const exportData = data.map(row => ({
        ID: row.id,
        Employee: row.employees?.name || 'Unknown',
        Position: row.employees?.job_title || 'Unknown',
        'Employee ID': row.employee_id,
        'Net Salary': row.salary_paid,
        'Payment Date': row.payment_date,
        Status: row.payment_status
      }));

      exportToCSV(
        exportData,
        `payslips_report_${new Date().toISOString().split('T')[0]}`,
        {
          ID: 'ID',
          Employee: 'Employee Name',
          Position: 'Job Title',
          'Employee ID': 'Employee ID',
          'Net Salary': 'Net Salary',
          'Payment Date': 'Payment Date',
          Status: 'Payment Status'
        }
      );

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
