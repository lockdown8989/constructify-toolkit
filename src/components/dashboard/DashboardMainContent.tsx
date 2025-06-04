
import React, { useState } from 'react';
import { Employee } from '@/components/salary/table/types';
import SalaryTable from '@/components/salary/table/SalaryTable';
import AttendanceReport from '@/components/dashboard/attendance-report';
import HiringStatistics from '@/components/dashboard/HiringStatistics';
import EmployeeComposition from '@/components/dashboard/EmployeeComposition';
import ManagerTab from '@/components/leave/tabs/ManagerTab';
import DashboardTimeClock from '@/components/dashboard/DashboardTimeClock';
import { useAuth } from '@/hooks/use-auth';

interface DashboardMainContentProps {
  isManager: boolean;
  salaryEmployees: Employee[];
}

const DashboardMainContent: React.FC<DashboardMainContentProps> = ({ 
  isManager, 
  salaryEmployees 
}) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const { isPayroll } = useAuth();
  
  const handleSelectEmployee = (id: string) => {
    setSelectedEmployee(id === selectedEmployee ? null : id);
  };

  // Only show salary information for payroll users
  if (isPayroll) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-3">
          <ManagerTab />
        </div>
        
        {/* Middle Column - Salary Table for Payroll Users Only */}
        <div className="lg:col-span-5">
          <SalaryTable 
            employees={salaryEmployees.map(emp => ({
              ...emp,
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <HiringStatistics className="col-span-1" />
            <EmployeeComposition className="col-span-1" />
          </div>
        </div>
      </div>
    );
  }

  // For managers and other users - no salary information
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Column */}
      <div className="lg:col-span-4">
        {isManager ? (
          <ManagerTab />
        ) : (
          <DashboardTimeClock />
        )}
      </div>
      
      {/* Middle Column */}
      <div className="lg:col-span-4">
        <AttendanceReport 
          employeeId={selectedEmployee ?? undefined}
          className="mb-6" 
        />
      </div>
      
      {/* Right Column */}
      <div className="lg:col-span-4">
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
