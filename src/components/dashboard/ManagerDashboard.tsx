
import React from 'react';
import CurrentDateTime from '@/components/dashboard/CurrentDateTime';
import DashboardStatsSection from '@/components/dashboard/DashboardStatsSection';
import AttendanceOverview from '@/components/dashboard/AttendanceOverview';
import ManagerTab from '@/components/leave/tabs/ManagerTab';
import AttendanceReport from '@/components/dashboard/attendance-report';
import HiringStatistics from '@/components/dashboard/HiringStatistics';
import EmployeeComposition from '@/components/dashboard/EmployeeComposition';

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
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({
  firstName,
  employeeCount,
  hiredCount,
}) => {
  return (
    <div className="max-w-[1800px] mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl md:text-4xl font-bold">Hello {firstName}</h1>
        <CurrentDateTime className="md:w-auto w-full mt-4 md:mt-0" />
      </div>
      
      {/* Real-time Attendance Overview */}
      <AttendanceOverview />
      
      {/* Stats */}
      <DashboardStatsSection 
        employeeCount={employeeCount} 
        hiredCount={hiredCount} 
        isManager={true} 
      />
      
      {/* Manager-specific content without salary information */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Leave Management */}
        <div className="lg:col-span-4">
          <ManagerTab />
        </div>
        
        {/* Middle Column - Attendance Report */}
        <div className="lg:col-span-4">
          <AttendanceReport className="mb-6" />
        </div>
        
        {/* Right Column - Statistics */}
        <div className="lg:col-span-4">
          <div className="grid grid-cols-1 gap-6">
            <HiringStatistics />
            <EmployeeComposition />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
