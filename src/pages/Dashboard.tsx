
import React from 'react';
import StatCard from '@/components/dashboard/StatCard';
import SalaryTable from '@/components/dashboard/SalaryTable';
import AttendanceReport from '@/components/dashboard/AttendanceReport';
import Calendar from '@/components/dashboard/Calendar';
import EmployeeComposition from '@/components/dashboard/EmployeeComposition';
import HiringStatistics from '@/components/dashboard/HiringStatistics';
import MeetingSchedule from '@/components/dashboard/MeetingSchedule';
import UserEmployeeLinkage from '@/components/dashboard/UserEmployeeLinkage';
import { useAuth } from '@/hooks/use-auth';

const Dashboard = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="pt-20 md:pt-24 px-4 sm:px-6 pb-10 animate-fade-in">
      <div className="max-w-[1800px] mx-auto">
        <h1 className="text-2xl md:text-4xl font-bold mb-5">Dashboard</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-6">
          <StatCard
            title="Total Employees"
            value="156"
            trend={{ value: 12, isPositive: true }}
            description="from last month"
          />
          <StatCard
            title="Open Positions"
            value="24"
            trend={{ value: 3, isPositive: false }}
            description="since last week"
          />
          <StatCard
            title="Training Hours"
            value="2,345"
            trend={{ value: 32, isPositive: true }}
            description="year to date"
          />
          <StatCard
            title="Time Off Requests"
            value="15"
            trend={{ value: 5, isPositive: true }}
            description="pending approval"
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <AttendanceReport />
          <EmployeeComposition />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Calendar meetings={[]} />
          <MeetingSchedule />
        </div>
        
        <div className="grid grid-cols-1 gap-6 mb-6">
          <SalaryTable employees={[]} />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <HiringStatistics />
          {isAdmin && <UserEmployeeLinkage />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
