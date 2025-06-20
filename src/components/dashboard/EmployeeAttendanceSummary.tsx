
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAttendance } from '@/hooks/use-attendance';
import { useQueryClient } from '@tanstack/react-query';

interface EmployeeAttendanceSummaryProps {
  employeeId: string | null;
}

const EmployeeAttendanceSummary: React.FC<EmployeeAttendanceSummaryProps> = ({ employeeId }) => {
  const queryClient = useQueryClient();
  const { data: attendanceData, isLoading } = useAttendance(employeeId ?? undefined);
  
  const currentTime = format(new Date(), 'dd MMM yyyy, hh:mm a');
  
  const stats = {
    onTime: attendanceData?.present || 0,
    workFromHome: 0, // Can be expanded with actual WFH data
    lateAttendance: attendanceData?.late || 0,
    absent: attendanceData?.absent || 0,
    totalHours: 1434,
    maxHours: 1500,
    percentageRank: 91.3
  };

  if (isLoading && employeeId) {
    return (
      <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 flex justify-center items-center min-h-[250px] sm:min-h-[300px]">
        <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-primary" />
      </Card>
    );
  }

  const handleViewStats = () => {
    console.log('View Stats clicked for employee:', employeeId);
    console.log('Attendance data:', attendanceData);
  };

  return (
    <Card className="p-4 sm:p-6 space-y-4 sm:space-y-6 h-full">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start space-y-2 sm:space-y-0">
        <div className="space-y-1">
          <h2 className="text-xs sm:text-sm text-gray-500">Current time</h2>
          <p className="text-lg sm:text-xl lg:text-2xl font-semibold break-all sm:break-normal">{currentTime}</p>
        </div>
        <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400 self-start sm:self-auto" />
      </div>

      <div className="space-y-4">
        {/* Title and View Stats */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-2 sm:space-y-0">
          <h3 className="text-lg sm:text-xl font-semibold">My Attendance</h3>
          <Link to="/attendance" onClick={handleViewStats}>
            <Button variant="ghost" className="text-blue-500 hover:text-blue-600 text-sm sm:text-base px-2 sm:px-4">
              View Stats
            </Button>
          </Link>
        </div>

        {/* Stats Grid - Responsive layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <div className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">{stats.onTime}</span>
            <span className="text-gray-500 text-xs sm:text-sm">on time</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-2 h-2 rounded-full bg-yellow-500 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">{stats.workFromHome}</span>
            <span className="text-gray-500 text-xs sm:text-sm">Work from home</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">{stats.lateAttendance}</span>
            <span className="text-gray-500 text-xs sm:text-sm">late attendance</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
            <div className="w-2 h-2 rounded-full bg-gray-500 flex-shrink-0" />
            <span className="font-medium text-sm sm:text-base">{stats.absent}</span>
            <span className="text-gray-500 text-xs sm:text-sm">absent</span>
          </div>
        </div>

        {/* Progress Section */}
        <div className="relative pt-2 sm:pt-4">
          {/* Hours Display */}
          <div className="flex justify-between items-end mb-2">
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold">{stats.totalHours}</span>
            <span className="text-gray-500 text-sm sm:text-base">/{stats.maxHours}</span>
          </div>
          
          {/* Progress Bar */}
          <div className="h-2 sm:h-3 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000 ease-out"
              style={{ 
                width: `${(stats.totalHours / stats.maxHours) * 100}%` 
              }}
            />
          </div>
          
          {/* Achievement Badge */}
          <div className="mt-3 sm:mt-4 flex items-center gap-2 text-green-600 bg-green-50 p-2 sm:p-3 rounded-lg">
            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-xs sm:text-sm font-medium">
              Better than {stats.percentageRank}% employees!
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeAttendanceSummary;
