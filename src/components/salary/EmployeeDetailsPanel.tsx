
import React from 'react';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Employee } from '@/hooks/use-employees';
import DocumentList from './components/DocumentList';
import EmployeeStatistics from './components/EmployeeStatistics';
import BasicInformation from './components/BasicInformation';
import EmployeeHeader from './components/EmployeeHeader';
import EmployeeInfo from './components/EmployeeInfo';

interface EmployeeDetailsPanelProps {
  employee: Employee;
  onBack: () => void;
}

const EmployeeDetailsPanel: React.FC<EmployeeDetailsPanelProps> = ({
  employee,
  onBack
}) => {
  const statisticsData = {
    holidayLeft: employee.annual_leave_days || 25,
    sickness: employee.sick_leave_days || 10
  };

  return (
    <Card className="rounded-3xl overflow-hidden">
      <EmployeeHeader employee={employee} onBack={onBack} />
      
      <div className="pt-16 px-6 pb-6">
        <EmployeeInfo employee={employee} />
        
        <div className="space-y-6">
          <div>
            <h3 className="text-xs font-semibold text-apple-gray-500 mb-5 uppercase tracking-wider">
              Basic Information
            </h3>
            <BasicInformation 
              department={employee.department}
              site={employee.site}
              siteIcon={employee.location === 'Remote' ? '🌐' : '🏢'}
              salary={employee.salary.toString()}
              startDate={employee.start_date}
              lifecycle={employee.lifecycle}
              email={`${employee.name.toLowerCase().replace(' ', '')}@company.com`}
            />
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-xs font-semibold text-apple-gray-500 mb-5 uppercase tracking-wider">
              Statistics
            </h3>
            <EmployeeStatistics 
              holidayLeft={statisticsData.holidayLeft}
              sickness={statisticsData.sickness}
            />
          </div>
          
          <Separator className="my-6" />
          
          <div>
            <h3 className="text-xs font-semibold text-apple-gray-500 mb-5 uppercase tracking-wider">
              Documents
            </h3>
            <DocumentList employeeId={employee.id} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeDetailsPanel;
