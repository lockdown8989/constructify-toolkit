
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useEmployees } from '@/hooks/use-employees';
import { SalaryTable } from '@/components/salary/table/SalaryTable';
import { PayrollStatsGrid } from '../stats/PayrollStatsGrid';

interface PayrollHistoryTabsProps {
  currentMonthEmployees?: any[];
  onSelectEmployee?: (id: string) => void;
  onUpdateStatus?: (id: string, status: "Paid" | "Absent" | "Pending") => void;
}

const PayrollHistoryTabs: React.FC<PayrollHistoryTabsProps> = ({
  currentMonthEmployees,
  onSelectEmployee,
  onUpdateStatus
}) => {
  const { data: employees, isLoading, error } = useEmployees();
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | null>(null);

  const handleSelectEmployee = (id: string) => {
    setSelectedEmployeeId(id);
    if (onSelectEmployee) {
      onSelectEmployee(id);
    }
  };

  const handleUpdateStatus = (id: string, status: "Paid" | "Absent" | "Pending") => {
    // This would be implemented with a mutation to update payroll status
    console.log(`Update employee ${id} status to ${status}`);
    if (onUpdateStatus) {
      onUpdateStatus(id, status);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center">Loading employee data...</div>;
  }

  if (error || !employees) {
    return (
      <div className="p-8 text-center">
        <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-2" />
        <h2 className="text-lg font-semibold">Error loading employee data</h2>
        <p className="text-gray-500">Please try again later</p>
      </div>
    );
  }

  // Calculate the stats for display
  const displayEmployees = currentMonthEmployees || employees;
  const totalPayroll = displayEmployees.reduce((sum, emp) => {
    const salary = parseInt(emp.salary?.toString().replace(/\$|,/g, '') || '0', 10);
    return sum + (emp.status !== 'Absent' ? salary : 0);
  }, 0);
  const paidEmployees = displayEmployees.filter(e => e.status === 'Paid').length;
  const pendingEmployees = displayEmployees.filter(e => e.status === 'Pending').length;
  const absentEmployees = displayEmployees.filter(e => e.status === 'Absent').length;

  return (
    <Card className="p-4">
      <Tabs defaultValue="payslips">
        <TabsList className="w-full">
          <TabsTrigger value="payslips" className="w-1/2">Payslips</TabsTrigger>
          <TabsTrigger value="statistics" className="w-1/2">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="payslips">
          <SalaryTable 
            employees={displayEmployees} 
            onSelectEmployee={handleSelectEmployee} 
            onUpdateStatus={handleUpdateStatus} 
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="statistics">
          <PayrollStatsGrid 
            totalPayroll={totalPayroll}
            totalEmployees={displayEmployees.length}
            paidEmployees={paidEmployees}
            pendingEmployees={pendingEmployees}
            absentEmployees={absentEmployees}
            className="mt-4"
          />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PayrollHistoryTabs;
