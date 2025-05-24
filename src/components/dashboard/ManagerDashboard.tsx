
import React from 'react';
import { Employee } from '@/components/dashboard/salary-table/types';
import CurrentDateTime from '@/components/dashboard/CurrentDateTime';
import DashboardStatsSection from '@/components/dashboard/DashboardStatsSection';
import DashboardMainContent from '@/components/dashboard/DashboardMainContent';
import AttendanceOverview from '@/components/dashboard/AttendanceOverview';

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
  salaryEmployees
}) => {
  return (
    <div className="max-w-[1800px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl md:text-4xl font-bold">Hello {firstName}</h1>
        <CurrentDateTime className="md:w-auto w-full mt-4 md:mt-0" />
      </div>
      
      {/* Replace Progress Bars with Real-time Attendance Overview */}
      <AttendanceOverview />
      
      {/* Stats */}
      <DashboardStatsSection 
        employeeCount={employeeCount} 
        hiredCount={hiredCount} 
        isManager={true} 
      />
      
      {/* Main Content */}
      <DashboardMainContent isManager={true} salaryEmployees={salaryEmployees} />
    </div>
  );
};

export default ManagerDashboard;
