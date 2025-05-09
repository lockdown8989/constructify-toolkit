
import React, { useState } from 'react';
import { Employee } from '@/components/dashboard/salary-table/types';
import SalaryTable from '@/components/salary/table/SalaryTable';
import AttendanceReport from '@/components/dashboard/attendance-report';
import HiringStatistics from '@/components/dashboard/HiringStatistics';
import EmployeeComposition from '@/components/dashboard/EmployeeComposition';
import ManagerTab from '@/components/leave/tabs/ManagerTab';
import DashboardTimeClock from '@/components/dashboard/DashboardTimeClock';

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

  // Convert employee data to ensure salary is a string for SalaryTable
  const formattedEmployees = salaryEmployees.map(emp => ({
    ...emp,
    // Ensure salary is always a string
    salary: typeof emp.salary === 'number' ? String(emp.salary) : emp.salary,
    selected: emp.id === selectedEmployee
  }));

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
          employees={formattedEmployees}
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
