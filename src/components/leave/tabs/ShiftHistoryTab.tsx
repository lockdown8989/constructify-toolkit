
import React from 'react';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import ShiftDetailCard from '@/components/schedule/ShiftDetailCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isAfter, subMonths } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';
import { convertEmployeeScheduleToSchedule } from '@/utils/schedule-utils';

const ShiftHistoryTab = () => {
  const { schedules, isLoading, refetch } = useEmployeeSchedule();
  const { user, isManager } = useAuth();
  const { toast } = useToast();
  
  // Filter schedules for responded ones (confirmed, completed or rejected)
  const respondedSchedules = schedules?.filter(s => 
    s.status === 'confirmed' || s.status === 'completed' || s.status === 'rejected'
  ) || [];

  // Sort schedules by date (most recent first)
  const sortedSchedules = [...respondedSchedules].sort((a, b) => 
    new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
  );
  
  // Filter out schedules older than one month
  const oneMonthAgo = subMonths(new Date(), 1);
  const recentSchedules = sortedSchedules.filter(schedule => 
    isAfter(parseISO(schedule.start_time), oneMonthAgo)
  );
  
  const handleRefresh = () => {
    refetch();
    toast({
      title: "Refreshed",
      description: "Shift history has been updated",
    });
  };
  
  return (
    <Card className="border shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
        <CardTitle className="flex items-center text-lg">
          <History className="h-5 w-5 mr-2 text-primary" />
          Shift History
          <span className="ml-2 text-sm text-muted-foreground font-normal">
            (last 30 days)
          </span>
        </CardTitle>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="pt-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
          </div>
        ) : recentSchedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500 flex flex-col items-center">
            <Info className="h-12 w-12 text-muted-foreground mb-2 opacity-50" />
            <p className="text-muted-foreground">No shift history available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Completed and rejected shifts from the last 30 days will appear here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentSchedules.map(schedule => {
              // Convert EmployeeSchedule to Schedule
              const convertedSchedule = convertEmployeeScheduleToSchedule(schedule);
              
              return (
                <div key={schedule.id}>
                  <ShiftDetailCard
                    schedule={convertedSchedule}
                    onInfoClick={() => {}}
                    onEmailClick={() => {}}
                    onCancelClick={() => {}}
                  />
                  <div className="mt-1 text-xs text-right text-muted-foreground">
                    Status: {schedule.status} • Updated: {format(parseISO(schedule.updated_at || schedule.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ShiftHistoryTab;
