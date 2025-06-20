
import React from "react";
import { useAuth } from "@/hooks/use-auth";
import DashboardHeader from "./DashboardHeader";
import AttendanceOverview from "./AttendanceOverview";
import GPSClockingMap from "./GPSClockingMap";
import UnifiedStatsCard from "./UnifiedStatsCard";

interface ManagerDashboardProps {
  firstName: string;
  employeeCount?: number;
  hiredCount?: number;
  interviewStats?: {
    interviews: number;
    hired: number;
    projectTime: number;
    output: number;
  };
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ 
  firstName = 'Manager'
}) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <DashboardHeader firstName={firstName} />
        
        {/* Unified Stats Card */}
        <div className="mb-8">
          <UnifiedStatsCard />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* GPS Clocking Map */}
          <GPSClockingMap />
          
          {/* Attendance Overview */}
          <AttendanceOverview />
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
