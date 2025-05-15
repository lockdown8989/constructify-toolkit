import React, { useEffect } from 'react';
import { PayrollStatsGrid } from '@/components/payroll/stats/PayrollStatsGrid';
import { PayrollActions } from '@/components/payroll/actions/PayrollActions';
import PayrollHistoryTabs from '@/components/payroll/history/PayrollHistoryTabs';
import { usePayroll } from '@/hooks/use-payroll';
import { Employee } from '@/components/dashboard/salary-table/types';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import ErrorDisplay from '@/components/people/ErrorDisplay';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useIsMobile } from '@/hooks/use-mobile';
import { FileText } from 'lucide-react';

const PayrollPage = () => {
  const isMobile = useIsMobile();
  
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
  const [selectedEmployees, setSelectedEmployees] = React.useState(new Set<string>());
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  
  const payrollHooks = usePayroll();
  
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
    setIsProcessing(true);
    try {
      // Convert to correct Employee type before passing to processPayroll
      const selectedEmployeesList = initialEmployees
        .filter(emp => selectedEmployees.has(emp.id))
        .map(emp => ({
          id: emp.id,
          name: emp.name,
          job_title: emp.job_title || emp.title || 'Employee',
          department: emp.department || '',
          site: emp.site || 'Main Office',
          salary: typeof emp.salary === 'number' ? emp.salary : 
                 typeof emp.salary === 'string' ? parseInt(emp.salary.replace(/[^0-9]/g, ''), 10) : 0,
          status: emp.status || 'Active',
          lifecycle: 'Active',
          start_date: new Date().toISOString()
        }));
        
      // Use the process payroll mutation
      const processMutation = payrollHooks.useProcessPayroll();
      await processMutation.mutateAsync(selectedEmployeesList);
      // Clear selection after processing
      setSelectedEmployees(new Set());
    } catch (err) {
      console.error("Error processing payroll:", err);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleExportPayroll = () => {
    setIsExporting(true);
    // Export logic would go here
    console.log("Exporting payroll for selected employees:", Array.from(selectedEmployees));
    setTimeout(() => {
      setIsExporting(false);
    }, 1000);
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
