
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useAttendance } from '@/hooks/use-attendance';
import { Skeleton } from '@/components/ui/skeleton';
import { addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import TimeRangeSelector from './TimeRangeSelector';
import StatisticCards from './StatisticCards';
import AttendanceRate from './AttendanceRate';
import AttendanceGrid from './AttendanceGrid';
import { supabase } from '@/integrations/supabase/client';

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
  const { data, isLoading, refetch } = useAttendance(employeeId, rangeDate);
  const { toast } = useToast();
  
  const attendanceRate = data?.total ? Math.round((data.present / data.total) * 100) : 0;

  // Set up real-time subscription for attendance changes
  useEffect(() => {
    const channel = supabase
      .channel('attendance-realtime')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'attendance',
          filter: employeeId ? `employee_id=eq.${employeeId}` : undefined
        },
        (payload) => {
          console.log('Attendance data changed:', payload);
          refetch();
          
          toast({
            title: "Attendance Updated",
            description: "Attendance data has been updated.",
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [employeeId, refetch, toast]);

  if (isLoading) {
    return (
      <div className={cn("bg-card text-card-foreground rounded-3xl p-6 border shadow-lg overflow-hidden relative", className)}>
        <div className="space-y-4 animate-pulse">
          <div className="h-8 w-1/3 bg-muted rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
            <div className="h-20 bg-muted rounded"></div>
          </div>
          <div className="h-40 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      "bg-card text-card-foreground rounded-3xl p-6 border shadow-lg overflow-hidden relative transition-colors duration-300", 
      className
    )}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium text-foreground">Attendance Report</h3>
        <TimeRangeSelector timeRange={timeRange} onTimeRangeChange={setTimeRange} />
      </div>
      
      <StatisticCards 
        present={data?.present || 0}
        absent={data?.absent || 0}
        late={data?.late || 0}
      />
      
      <AttendanceRate rate={attendanceRate} />
      
      <AttendanceGrid 
        present={data?.present || 0}
        absent={data?.absent || 0}
        late={data?.late || 0}
        total={data?.total || 0}
      />
      
      {/* Decorative elements */}
      <div className="absolute bottom-0 right-0 w-20 h-20 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-10 left-10 w-10 h-10 bg-accent/10 rounded-full blur-xl pointer-events-none" />
    </div>
  );
};

export default AttendanceReport;
