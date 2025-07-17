
import React from 'react';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import ShiftDetailCard from '@/components/schedule/ShiftDetailCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { History, Info, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, isAfter, subMonths } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

const ShiftHistoryTab = () => {
  const { schedules, isLoading, refetch } = useEmployeeSchedule();
  const { user, isManager } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
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
    <div className={isMobile ? 'px-4' : ''}>
      <Card className={`border shadow-sm ${isMobile ? 'mx-0 rounded-lg' : ''}`}>
        <CardHeader className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-row items-center justify-between'} border-b ${isMobile ? 'pb-4 px-4' : 'pb-3'}`}>
          <CardTitle className={`flex items-center ${isMobile ? 'text-base' : 'text-lg'}`}>
            <History className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} mr-2 text-primary`} />
            Shift History
            <span className={`ml-2 ${isMobile ? 'text-xs' : 'text-sm'} text-muted-foreground font-normal`}>
              (last 30 days)
            </span>
          </CardTitle>
          <Button 
            variant="outline" 
            size={isMobile ? 'sm' : 'sm'} 
            onClick={handleRefresh}
            className={isMobile ? 'w-full sm:w-auto' : ''}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </CardHeader>
        <CardContent className={`${isMobile ? 'px-4 pt-4' : 'pt-4'}`}>
          {isLoading ? (
            <div className={`flex items-center justify-center ${isMobile ? 'py-6' : 'py-8'}`}>
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
            </div>
          ) : recentSchedules.length === 0 ? (
            <div className={`text-center ${isMobile ? 'py-6' : 'py-8'} text-gray-500 flex flex-col items-center`}>
              <Info className={`${isMobile ? 'h-10 w-10' : 'h-12 w-12'} text-muted-foreground mb-2 opacity-50`} />
              <p className={`text-muted-foreground ${isMobile ? 'text-sm' : ''}`}>
                No shift history available
              </p>
              <p className={`${isMobile ? 'text-xs' : 'text-xs'} text-muted-foreground mt-1`}>
                Completed and rejected shifts from the last 30 days will appear here
              </p>
            </div>
          ) : (
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              {recentSchedules.map(schedule => (
                <div key={schedule.id}>
                  <ShiftDetailCard
                    schedule={schedule}
                    onInfoClick={() => {}}
                    onEmailClick={() => {}}
                    onCancelClick={() => {}}
                  />
                  <div className={`mt-1 ${isMobile ? 'text-xs' : 'text-xs'} text-right text-muted-foreground`}>
                    Status: {schedule.status} • Updated: {format(parseISO(schedule.updated_at || schedule.created_at), 'MMM d, yyyy')}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftHistoryTab;
