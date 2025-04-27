
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import SalaryTable from '@/components/dashboard/salary-table';
import { Employee } from '@/components/dashboard/salary-table/types';

interface PayrollHistoryTabsProps {
  currentMonthEmployees: Employee[];
  onSelectEmployee: (id: string) => void;
  onUpdateStatus: (id: string, status: 'Paid' | 'Absent' | 'Pending') => void;
}

export const PayrollHistoryTabs: React.FC<PayrollHistoryTabsProps> = ({
  currentMonthEmployees,
  onSelectEmployee,
  onUpdateStatus,
}) => {
  return (
    <Tabs defaultValue="current">
      <TabsList className="mb-6">
        <TabsTrigger value="current">Current Month</TabsTrigger>
        <TabsTrigger value="previous">Previous Month</TabsTrigger>
        <TabsTrigger value="history">Payment History</TabsTrigger>
      </TabsList>
      
      <TabsContent value="current">
        <SalaryTable 
          employees={currentMonthEmployees}
          onSelectEmployee={onSelectEmployee}
          onUpdateStatus={onUpdateStatus}
        />
      </TabsContent>
      
      <TabsContent value="previous">
        <div className="bg-white rounded-3xl p-6 text-center py-12">
          <h3 className="text-xl font-medium mb-2">Previous Month's Payslips</h3>
          <p className="text-gray-500">Payslip data for previous month is archived.</p>
          <Button className="mt-4" variant="outline">
            View Archive
          </Button>
        </div>
      </TabsContent>
      
      <TabsContent value="history">
        <div className="bg-white rounded-3xl p-6 text-center py-12">
          <h3 className="text-xl font-medium mb-2">Payment History</h3>
          <p className="text-gray-500">View detailed payslip history and generate reports.</p>
          <Button className="mt-4" variant="outline">
            Generate Report
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  );
};
