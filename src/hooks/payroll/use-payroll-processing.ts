
import { useState, useCallback } from 'react';
import { useToast } from '../use-toast';
import { supabase } from '@/integrations/supabase/client';
import { generatePayslipPDF, PayslipData } from '@/utils/exports/payslip-generator';
import { format } from 'date-fns';
import { Employee } from '@/types/employee';

export const usePayrollProcessing = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  // Process payroll for all employees
  const processPayroll = useCallback(async (employees: Employee[], payPeriod: string) => {
    setIsProcessing(true);
    setProgress(0);
    setProcessedCount(0);
    setTotalCount(employees.length);
    
    try {
      // Record payroll processing start in history
      const { error: historyError } = await supabase
        .from('payroll_history')
        .insert({
          period: payPeriod,
          status: 'processing',
          employees_count: employees.length,
          started_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id || 'unknown'
        });
      
      if (historyError) {
        throw historyError;
      }
      
      // Process each employee payroll
      let successCount = 0;
      let failedCount = 0;
      
      for (let i = 0; i < employees.length; i++) {
        try {
          const employee = employees[i];
          
          // Update progress
          const currentProgress = Math.round(((i + 1) / employees.length) * 100);
          setProgress(currentProgress);
          setProcessedCount(i + 1);
          
          // Generate payslip
          await generateAndStorePayslip(employee, payPeriod);
          
          // Update employee payroll status
          await supabase
            .from('employees')
            .update({ last_paid: new Date().toISOString() })
            .eq('id', employee.id);
          
          successCount++;
        } catch (err) {
          console.error(`Failed to process payroll for employee ${employees[i].name}:`, err);
          failedCount++;
        }
      }
      
      // Record payroll processing completion
      await supabase
        .from('payroll_history')
        .insert({
          period: payPeriod,
          status: 'completed',
          employees_count: employees.length,
          succeeded_count: successCount,
          failed_count: failedCount,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString(),
          processed_by: (await supabase.auth.getUser()).data.user?.id || 'unknown'
        });
      
      toast({
        title: 'Payroll Processing Complete',
        description: `Successfully processed ${successCount} payslips. Failed: ${failedCount}.`,
        variant: failedCount > 0 ? 'destructive' : 'default',
      });
      
      return {
        success: true,
        successCount,
        failedCount
      };
    } catch (error) {
      console.error('Error processing payroll:', error);
      toast({
        title: 'Payroll Processing Failed',
        description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  // Generate and store payslip for an individual employee
  const generateAndStorePayslip = async (employee: Employee, payPeriod: string) => {
    // Format payment date
    const [month, year] = payPeriod.split(' ');
    
    // Create payslip data
    const payslipData: PayslipData = {
      name: employee.name,
      title: employee.job_title || 'Employee',
      department: employee.department || 'General',
      salary: `$${employee.salary?.toLocaleString() || '0'}`,
      paymentDate: payPeriod
    };
    
    // Generate PDF blob
    const pdfBlob = await generatePayslipPDF(payslipData);
    
    // Create file name
    const fileName = `${employee.name.replace(/\s/g, '_')}_payslip_${month}_${year}.pdf`;
    const filePath = `payslips/${employee.id}/${year}/${month}/${fileName}`;
    
    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('payslips')
      .upload(filePath, pdfBlob);
    
    if (uploadError) {
      throw uploadError;
    }
    
    // Create payslip record
    const { error: recordError } = await supabase
      .from('payslips')
      .insert({
        employee_id: employee.id,
        month: month,
        year: year,
        amount: employee.salary,
        status: 'generated',
        file_path: filePath,
        created_at: new Date().toISOString()
      });
    
    if (recordError) {
      throw recordError;
    }
  };

  // Process payroll for a single employee
  const processSinglePayroll = useCallback(async (employee: Employee, payPeriod: string) => {
    setIsProcessing(true);
    
    try {
      await generateAndStorePayslip(employee, payPeriod);
      
      toast({
        title: 'Payroll Processed',
        description: `Successfully processed payslip for ${employee.name}.`,
      });
      
      return true;
    } catch (error) {
      console.error('Error processing individual payroll:', error);
      toast({
        title: 'Payroll Processing Failed',
        description: `An error occurred: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: 'destructive',
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  return {
    isProcessing,
    progress,
    processedCount,
    totalCount,
    processPayroll,
    processSinglePayroll
  };
};
