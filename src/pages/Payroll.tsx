import React, { useState } from 'react';
import { PayrollStatsGrid } from '@/components/payroll/stats/PayrollStatsGrid';
import { PayrollActions } from '@/components/payroll/actions/PayrollActions';
import PayrollHistoryTabs from '@/components/payroll/history/PayrollHistoryTabs';
import { usePayroll } from '@/hooks/use-payroll';
import { Employee } from '@/types/employee';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ErrorDisplay from '@/components/people/ErrorDisplay';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateCSV } from '@/utils/exports/csv-exporter';

const PayrollPage = () => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Fetch employees data
  const { data: employees, isLoading, error, refetch } = useQuery({
    queryKey: ['employees-payroll'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*');
        
      if (error) throw error;
      
      return data as Employee[];
    }
  });

  const initialEmployees = employees || [];
  
  // Create a set to track selected employees and other state variables
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set<string>());
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  
  const { useProcessPayroll, usePayrollData } = usePayroll();
  const processPayrollMutation = useProcessPayroll();
  
  // Handler functions
  const handleSelectEmployee = (id: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEmployees(newSelected);
  };
  
  const handleSelectAll = () => {
    if (initialEmployees.length > 0 && selectedEmployees.size === initialEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      const allIds = new Set(initialEmployees.map(emp => emp.id));
      setSelectedEmployees(allIds);
    }
  };
  
  const handleClearAll = () => {
    setSelectedEmployees(new Set());
  };
  
  // Update the handleProcessPayroll function
  const handleProcessPayroll = async () => {
    if (selectedEmployees.size === 0) {
      toast({
        title: "No employees selected",
        description: "Please select at least one employee to process payslips.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Convert to correct Employee type before passing to processPayroll
      const selectedEmployeesList = initialEmployees
        .filter(emp => selectedEmployees.has(emp.id))
        .map(emp => ({
          ...emp,
          job_title: emp.job_title || emp.title || 'Employee',
          department: emp.department || '',
          site: emp.site || 'Main Office',
          salary: typeof emp.salary === 'number' ? emp.salary : 
                 typeof emp.salary === 'string' ? parseInt(emp.salary.replace(/[^0-9]/g, ''), 10) : 0,
          status: emp.status || 'Active',
          lifecycle: 'Active',
          start_date: emp.start_date || new Date().toISOString()
        }));
        
      // Process payroll using the mutation
      await processPayrollMutation.mutateAsync(selectedEmployeesList);
      
      toast({
        title: "Success",
        description: `Successfully processed payroll for ${selectedEmployeesList.length} employees.`
      });
      
      // Clear selection after processing
      setSelectedEmployees(new Set());
    } catch (err) {
      console.error("Error processing payroll:", err);
      toast({
        title: "Error",
        description: "Failed to process payroll. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleExportPayroll = async () => {
    setIsExporting(true);
    try {
      // Fetch current payroll data
      const { data: payrollData } = await supabase
        .from('payroll')
        .select(`
          *,
          employees (name, job_title, department)
        `)
        .order('payment_date', { ascending: false });
      
      if (!payrollData || payrollData.length === 0) {
        toast({
          title: "No data to export",
          description: "There is no payroll data available to export.",
          variant: "warning"
        });
        return;
      }
      
      // Format the data for CSV export
      const csvData = payrollData.map(record => {
        const employee = record.employees as { 
          name?: string, 
          job_title?: string, 
          department?: string 
        } | null;
        
        return {
          "Employee Name": employee?.name || 'Unknown',
          "Job Title": employee?.job_title || 'Unknown',
          "Department": employee?.department || 'Unknown',
          "Payment Date": record.payment_date || new Date().toISOString().split('T')[0],
          "Payment Status": record.payment_status || 'Unknown',
          "Working Hours": record.working_hours || 0,
          "Base Pay": record.base_pay || 0,
          "Overtime Hours": record.overtime_hours || 0,
          "Overtime Pay": record.overtime_pay || 0,
          "Deductions": record.deductions || 0,
          "Bonus": record.bonus || 0,
          "Total Paid": record.salary_paid || 0
        };
      });
      
      // Generate and download the CSV file
      generateCSV(csvData, `payroll_export_${new Date().toISOString().split('T')[0]}.csv`);
      
      toast({
        title: "Export successful",
        description: "Payroll data has been exported to CSV successfully."
      });
    } catch (error) {
      console.error("Error exporting payroll:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the payroll data.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate statistics
  const paidEmployees = initialEmployees.filter(e => e.status === 'Paid').length;
  const pendingEmployees = initialEmployees.filter(e => e.status === 'Pending').length;
  const absentEmployees = initialEmployees.filter(e => e.status === 'Absent').length;
  const totalPayroll = initialEmployees.reduce((sum, emp) => {
    const salary = parseInt(emp.salary?.toString().replace(/\$|,/g, '') || '0', 10);
    return sum + (emp.status !== 'Absent' ? salary : 0);
  }, 0);

  if (isLoading) {
    return (
      <div className="container py-6 animate-fade-in">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Payslip Management</h1>
          </div>
          <p className="text-muted-foreground">Process and manage employee payslips</p>
        </header>
        
        <Card className="p-6 mb-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-6 animate-fade-in">
        <header className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <FileText className="h-6 w-6" />
            <h1 className="text-2xl font-bold">Payslip Management</h1>
          </div>
        </header>
        <ErrorDisplay 
          title="Error loading payroll data" 
          error={error as Error}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="container py-6 animate-fade-in">
      <header className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Payslip Management</h1>
        </div>
        <p className="text-muted-foreground">Process and manage employee payslips</p>
      </header>
      
      <div className={`grid grid-cols-1 ${!isMobile ? 'md:grid-cols-4' : ''} gap-6 mb-6`}>
        <div className={isMobile ? '' : 'md:col-span-3'}>
          <PayrollStatsGrid
            totalPayroll={totalPayroll}
            totalEmployees={initialEmployees.length}
            paidEmployees={paidEmployees}
            pendingEmployees={pendingEmployees}
            absentEmployees={absentEmployees}
          />
        </div>
        
        <div>
          <PayrollActions
            selectedCount={selectedEmployees.size}
            isProcessing={isProcessing}
            isExporting={isExporting}
            onProcessPayroll={handleProcessPayroll}
            onExportPayroll={handleExportPayroll}
            employees={initialEmployees}
            selectedEmployees={selectedEmployees}
            onSelectEmployee={handleSelectEmployee}
            onSelectAll={handleSelectAll}
            onClearAll={handleClearAll}
          />
        </div>
      </div>
      
      <div className="mt-8">
        <PayrollHistoryTabs />
      </div>
    </div>
  );
};

export default PayrollPage;
