
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useAttendanceSync } from '@/hooks/use-attendance-sync';
import { useAttendance } from '@/hooks/use-attendance';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

const EmployeeAttendanceSummary = () => {
  useAttendanceSync(); // Enable real-time sync
  const { data: attendanceData } = useAttendance();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isManager, isAdmin, isHR, isPayroll } = useAuth();

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

  const handleViewStats = () => {
    // Only managers, admin, hr can view stats
    if (isManager || isAdmin || isHR) {
      navigate('/attendance');
    } else {
      toast({
        title: "Access Denied",
        description: "You do not have permission to view detailed attendance stats.",
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-sm text-gray-500">Current time</h2>
          <p className="text-xl font-semibold">{currentTime}</p>
        </div>
        <Clock className="w-8 h-8 text-gray-400" />
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-semibold">My Attendance</h3>
          <Button 
            variant="ghost" 
            className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
            onClick={handleViewStats}
            data-testid="view-stats"
          >
            View Stats
          </Button>
        </div>

        <div className="grid gap-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="font-medium">{stats.onTime}</span>
            <span className="text-gray-500">on time</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-yellow-500" />
            <span className="font-medium">{stats.workFromHome}</span>
            <span className="text-gray-500">Work from home</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="font-medium">{stats.lateAttendance}</span>
            <span className="text-gray-500">late attendance</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-gray-500" />
            <span className="font-medium">{stats.absent}</span>
            <span className="text-gray-500">absent</span>
          </div>
        </div>

        <div className="relative pt-4">
          <div className="flex justify-between mb-2">
            <span className="text-2xl font-bold">{stats.totalHours}</span>
            <span className="text-gray-500">/{stats.maxHours}</span>
          </div>
          
          <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full"
              style={{ 
                width: `${(stats.totalHours / stats.maxHours) * 100}%` 
              }}
            />
          </div>
          
          <div className="mt-4 flex items-center gap-2 text-green-600">
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <span className="text-sm">
              Better than {stats.percentageRank}% employees!
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmployeeAttendanceSummary;
