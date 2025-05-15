
import React from 'react';
import { Employee } from '@/components/dashboard/salary-table/types';
import CurrentDateTime from '@/components/dashboard/CurrentDateTime';
import DashboardStatsSection from '@/components/dashboard/DashboardStatsSection';
import DashboardProgressSection from '@/components/dashboard/DashboardProgressSection';
import DashboardMainContent from '@/components/dashboard/DashboardMainContent';

interface ManagerDashboardProps {
  firstName: string;
  employeeCount: number;
  hiredCount: number;
  interviewStats: {
    interviews: number;
    hired: number;
    projectTime: number;
    output: number;
  };
  salaryEmployees: Employee[];
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  firstName,
  employeeCount,
  hiredCount,
  interviewStats,
  salaryEmployees
}) => {
  // Convert Employee[] from salary-table/types to Employee[] from types/employee
  const mappedEmployees = salaryEmployees.map(emp => ({
    ...emp,
    job_title: emp.job_title || emp.title || 'Employee',
    site: emp.site || 'Main Office',
    department: emp.department || 'General',
    status: (emp.status === 'Paid' || emp.status === 'Pending' || emp.status === 'Absent') 
            ? emp.status 
            : 'Pending'
  }));

  return (
    <div className="max-w-[1800px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl md:text-4xl font-bold">Hello {firstName}</h1>
        <CurrentDateTime className="md:w-auto w-full mt-4 md:mt-0" />
      </div>
      
      {/* Progress Bars - Only show for managers */}
      <DashboardProgressSection interviewStats={interviewStats} />
      
      {/* Stats */}
      <DashboardStatsSection 
        employeeCount={employeeCount} 
        hiredCount={hiredCount} 
        isManager={true} 
      />
      
      {/* Main Content */}
      <DashboardMainContent isManager={true} salaryEmployees={mappedEmployees} />
    </div>
  );
};

export default ManagerDashboard;
