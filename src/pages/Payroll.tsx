
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { PayrollStatsGrid } from '@/components/payroll/stats/PayrollStatsGrid';
import { PayrollActions } from '@/components/payroll/actions/PayrollActions';
import { PayrollHistoryTabs } from '@/components/payroll/history/PayrollHistoryTabs';
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
  const { isPayroll } = useAuth();
  
  // Only allow payroll users to access this page
  if (!isPayroll) {
    return (
      <div className="container py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="text-gray-600 mt-2">This page is only accessible to payroll users.</p>
        </div>
      </div>
    );
  }
  
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
  
  const {
    selectedEmployees,
    isProcessing,
    isExporting,
    handleSelectEmployee,
    handleSelectAll,
    handleClearAll,
    handleProcessPayroll,
    handleExportPayroll,
  } = usePayroll(initialEmployees);

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
        <PayrollHistoryTabs
          currentMonthEmployees={initialEmployees}
          onSelectEmployee={handleSelectEmployee}
          onUpdateStatus={(id, status) => {
            // Update employee status logic would go here
            console.log('Update status:', id, status);
          }}
        />
      </div>
    </div>
  );
};

export default PayrollPage;
