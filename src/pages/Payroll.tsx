
import React from 'react';
import { PayrollStatsGrid } from '@/components/payroll/stats/PayrollStatsGrid';
import { PayrollActions } from '@/components/payroll/actions/PayrollActions';
import { PayrollHistoryTabs } from '@/components/payroll/history/PayrollHistoryTabs';
import { usePayroll } from '@/hooks/use-payroll';
import { Employee } from '@/components/dashboard/salary-table/types';

const PayrollPage = () => {
  const initialEmployees: Employee[] = []; // This would be populated from your data source
  const {
    selectedEmployees,
    isProcessing,
    isExporting,
    handleSelectEmployee,
    handleProcessPayroll,
    handleExportPayroll,
  } = usePayroll(initialEmployees);

  // Calculate statistics
  const paidEmployees = initialEmployees.filter(e => e.status === 'Paid').length;
  const pendingEmployees = initialEmployees.filter(e => e.status === 'Pending').length;
  const absentEmployees = initialEmployees.filter(e => e.status === 'Absent').length;
  const totalPayroll = initialEmployees.reduce((sum, emp) => {
    const salary = parseInt(emp.salary.replace(/\$|,/g, ''), 10);
    return sum + (emp.status !== 'Absent' ? salary : 0);
  }, 0);

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Payslip Management</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="md:col-span-3">
          <PayrollStatsGrid
            totalPayroll={totalPayroll}
            totalEmployees={initialEmployees.length}
            paidEmployees={paidEmployees}
            pendingEmployees={pendingEmployees}
            absentEmployees={absentEmployees}
          />
        </div>
        
        <PayrollActions
          selectedCount={selectedEmployees.size}
          isProcessing={isProcessing}
          isExporting={isExporting}
          onProcessPayroll={handleProcessPayroll}
          onExportPayroll={handleExportPayroll}
        />
      </div>
      
      <PayrollHistoryTabs
        currentMonthEmployees={initialEmployees}
        onSelectEmployee={handleSelectEmployee}
        onUpdateStatus={(id, status) => {
          // Update employee status logic would go here
          console.log('Update status:', id, status);
        }}
      />
    </div>
  );
};

export default PayrollPage;
