
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import { useEmployees } from '@/hooks/use-employees';
import { SalaryTable } from '@/components/salary/table/SalaryTable';
import { PayrollStatsGrid } from '../stats/PayrollStatsGrid';

const PayrollHistoryTabs: React.FC = () => {
  const { data: employees, isLoading, error } = useEmployees();
  const [selectedEmployeeId, setSelectedEmployeeId] = React.useState<string | null>(null);

  const handleSelectEmployee = (id: string) => {
    setSelectedEmployeeId(id);
  };

  const handleUpdateStatus = (id: string, status: "Paid" | "Absent" | "Pending") => {
    // This would be implemented with a mutation to update payroll status
    console.log(`Update employee ${id} status to ${status}`);
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

  return (
    <Card className="p-4">
      <Tabs defaultValue="payslips">
        <TabsList className="w-full">
          <TabsTrigger value="payslips" className="w-1/2">Payslips</TabsTrigger>
          <TabsTrigger value="statistics" className="w-1/2">Statistics</TabsTrigger>
        </TabsList>
        <TabsContent value="payslips">
          <SalaryTable 
            employees={employees} 
            onSelectEmployee={handleSelectEmployee} 
            onUpdateStatus={handleUpdateStatus} 
            className="mt-4"
          />
        </TabsContent>
        <TabsContent value="statistics">
          <PayrollStatsGrid employees={employees} className="mt-4" />
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default PayrollHistoryTabs;
