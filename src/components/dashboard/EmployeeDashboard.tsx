
import React from 'react';
import { Card } from '@/components/ui/card';
import EmployeeAttendanceSummary from '@/components/dashboard/EmployeeAttendanceSummary';
import EmployeeStatistics from '@/components/people/EmployeeStatistics';
import DocumentList from '@/components/salary/components/DocumentList';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';

const EmployeeDashboard: React.FC<{ firstName: string }> = ({ firstName }) => {
  const { employeeId: currentEmployeeId } = useEmployeeDataManagement();

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-2xl font-bold mb-6">Hello {firstName}</h1>
      <div className="grid gap-6">
        <EmployeeAttendanceSummary />
        
        <Card className="p-6">
          <h3 className="text-xs font-semibold text-gray-500 mb-5 uppercase tracking-wider">
            Statistics
          </h3>
          <EmployeeStatistics employeeId={currentEmployeeId} />
        </Card>
        
        <Card className="p-6">
          <h3 className="text-xs font-semibold text-gray-500 mb-5 uppercase tracking-wider">
            Documents
          </h3>
          <DocumentList employeeId={currentEmployeeId} />
        </Card>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
