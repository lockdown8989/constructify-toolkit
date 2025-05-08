
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useAttendance } from '@/hooks/use-attendance';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays } from 'date-fns';
import TimeRangeSelector from './TimeRangeSelector';
import StatisticCards from './StatisticCards';
import AttendanceRate from './AttendanceRate';
import AttendanceGrid from './AttendanceGrid';

interface AttendanceReportProps {
  employeeId?: string;
  className?: string;
}

const AttendanceReport: React.FC<AttendanceReportProps> = ({ 
  className,
  employeeId
}) => {
  const [timeRange, setTimeRange] = useState<number>(30);
  const rangeDate = addDays(new Date(), -timeRange);
  const { data, isLoading } = useAttendance(employeeId, rangeDate);
  
  const attendanceRate = data?.total ? Math.round((data.present / data.total) * 100) : 0;

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
        <TimeRangeSelector timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      </div>
      
      {/* Display attendance statistics in cards */}
      <StatisticCards 
        present={data?.present || 0}
        absent={data?.absent || 0}
        late={data?.late || 0}
      />
      
      {/* Attendance Rate */}
      <AttendanceRate rate={attendanceRate} />
      
      {/* Attendance Grid */}
      <AttendanceGrid 
        present={data?.present || 0}
        absent={data?.absent || 0}
        late={data?.late || 0}
        total={data?.total || 0}
      />
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-green-400/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-10 h-10 bg-green-400/10 rounded-full blur-xl pointer-events-none" />
    </div>
  );
};

export default AttendanceReport;
