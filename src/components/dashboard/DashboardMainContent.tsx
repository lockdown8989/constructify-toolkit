
import React, { useState } from 'react';
import { Employee } from '@/types/employee';  // Import from the main Employee type
import SalaryTable from '@/components/salary/table/SalaryTable';
import AttendanceReport from '@/components/dashboard/attendance-report';
import HiringStatistics from '@/components/dashboard/HiringStatistics';
import EmployeeComposition from '@/components/dashboard/EmployeeComposition';
import ManagerTab from '@/components/leave/tabs/ManagerTab';
import DashboardTimeClock from '@/components/dashboard/DashboardTimeClock';
import { SalaryTableProps } from '@/components/salary/table/types';

interface DashboardMainContentProps {
  isManager: boolean;
  salaryEmployees: Employee[];
}

const DashboardMainContent: React.FC<DashboardMainContentProps> = ({ 
  isManager, 
  salaryEmployees 
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  
  const handleSelectEmployee = (id: string) => {
    setSelectedEmployee(id === selectedEmployee ? null : id);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-3">
        {isManager ? (
          <ManagerTab />
        ) : (
          <DashboardTimeClock />
        )}
      </div>
      
      {/* Middle Column */}
      <div className="lg:col-span-5">
        <SalaryTable 
          employees={salaryEmployees.map(emp => ({
            ...emp,
            title: emp.title || emp.job_title || 'Employee',
            job_title: emp.job_title || emp.title || 'Employee',
            site: emp.site || 'Main Office',
            department: emp.department || 'General',
            status: (emp.status === 'Paid' || emp.status === 'Pending' || emp.status === 'Absent') 
                    ? emp.status 
                    : 'Pending' as 'Paid' | 'Pending' | 'Absent',
            selected: emp.id === selectedEmployee
          }))} 
          onSelectEmployee={handleSelectEmployee}
        />
      </div>
      
      {/* Right Column */}
      <div className="lg:col-span-4">
        <AttendanceReport 
          employeeId={selectedEmployee ?? undefined}
          className="mb-6" 
        />
        
        {/* Only show stats for managers */}
        {isManager && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HiringStatistics className="col-span-1" />
            <EmployeeComposition className="col-span-1" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardMainContent;
