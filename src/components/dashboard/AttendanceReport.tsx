
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronUp, ChevronDown, Calendar, Users, Clock } from 'lucide-react';
import { useAttendance } from '@/hooks/use-attendance';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays } from 'date-fns';

interface AttendanceReportProps {
  present?: number;
  absent?: number;
  className?: string;
  employeeId?: string;
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({ 
  className,
  employeeId
}) => {
  const [timeRange, setTimeRange] = useState<number>(30);
  const rangeDate = addDays(new Date(), -timeRange);
  const { data, isLoading } = useAttendance(employeeId, rangeDate);
  
  const attendanceRate = data?.total ? Math.round((data.present / data.total) * 100) : 0;
  
  const generateGrid = () => {
    const totalCells = 48;
    const presentPercentage = data?.total ? data.present / data.total : 0;
    const absentPercentage = data?.total ? data.absent / data.total : 0;
    const latePercentage = data?.total ? data.late / data.total : 0;
    
    const presentCells = Math.round(totalCells * presentPercentage);
    const absentCells = Math.round(totalCells * absentPercentage);
    const lateCells = Math.round(totalCells * latePercentage);
    
    return Array.from({ length: totalCells }).map((_, index) => {
      if (index < presentCells) return 'present';
      if (index < presentCells + absentCells) return 'absent';
      if (index < presentCells + absentCells + lateCells) return 'late';
      return 'empty';
    });
  };

  const grid = generateGrid();

  if (isLoading) {
    return (
      <div className={cn("bg-gray-900 text-white rounded-3xl p-6 card-shadow overflow-hidden relative", className)}>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-1/3 bg-gray-800 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-gray-800 rounded"></div>
            <div className="h-20 bg-gray-800 rounded"></div>
            <div className="h-20 bg-gray-800 rounded"></div>
          </div>
          <div className="h-40 bg-gray-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-gray-900 text-white rounded-3xl p-6 card-shadow overflow-hidden relative", 
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium">Attendance Report</h3>
        <div className="flex space-x-2">
          <button 
            onClick={() => setTimeRange(7)} 
            className={cn(
              "text-xs px-2 py-1 rounded-full transition-colors",
              timeRange === 7 ? "bg-white text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}
          >
            7d
          </button>
          <button 
            onClick={() => setTimeRange(30)} 
            className={cn(
              "text-xs px-2 py-1 rounded-full transition-colors",
              timeRange === 30 ? "bg-white text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}
          >
            30d
          </button>
          <button 
            onClick={() => setTimeRange(90)} 
            className={cn(
              "text-xs px-2 py-1 rounded-full transition-colors",
              timeRange === 90 ? "bg-white text-black" : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            )}
          >
            90d
          </button>
        </div>
      </div>
      
      
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gray-800 rounded-xl p-3 flex items-center">
              <Users className="w-5 h-5 mr-3 text-green-400" />
              <div>
                <p className="text-xs text-gray-400">Present</p>
                <p className="text-lg font-semibold">{data?.present}</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 flex items-center">
              <Calendar className="w-5 h-5 mr-3 text-red-400" />
              <div>
                <p className="text-xs text-gray-400">Absent</p>
                <p className="text-lg font-semibold">{data?.absent}</p>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl p-3 flex items-center">
              <Clock className="w-5 h-5 mr-3 text-yellow-400" />
              <div>
                <p className="text-xs text-gray-400">Late</p>
                <p className="text-lg font-semibold">{data?.late}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-end space-x-6 mb-6">
            <div>
              <p className="text-xs text-gray-400 mb-1">Attendance Rate</p>
              <span className="text-5xl font-semibold flex items-center">
                {attendanceRate}%
                {attendanceRate > 80 ? (
                  <ChevronUp className="w-5 h-5 ml-2 text-green-400" />
                ) : (
                  <ChevronDown className="w-5 h-5 ml-2 text-red-400" />
                )}
              </span>
            </div>
          </div>
          
          {/* Attendance Grid */}
          <p className="text-xs text-gray-400 mb-2">Attendance Distribution</p>
          <div className="grid grid-cols-8 gap-2">
            {grid.map((type, index) => (
              <div 
                key={index}
                className={cn(
                  "w-5 h-5 rounded-full transition-all duration-300 animate-fade-in",
                  type === 'present' && "bg-green-400",
                  type === 'absent' && "bg-red-400/60",
                  type === 'late' && "bg-yellow-400/80",
                  type === 'empty' && "bg-gray-800"
                )}
                style={{ animationDelay: `${index * 10}ms` }}
              />
            ))}
          </div>
          
          <div className="mt-4 flex items-center text-xs text-gray-400 space-x-4">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-green-400 mr-2"></div>
              <span>Present</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-red-400/60 mr-2"></div>
              <span>Absent</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-yellow-400/80 mr-2"></div>
              <span>Late</span>
            </div>
          </div>
        </>
      
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-green-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-10 h-10 bg-green-400/10 rounded-full blur-xl pointer-events-none" />
    </div>
  );
};

export default AttendanceReport;
