
import React from 'react';
import { format } from 'date-fns';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import { RefreshCw } from 'lucide-react';
import WeeklyCalendarView from '@/components/schedule/WeeklyCalendarView';
import { ScheduleDialogs } from './components/ScheduleDialogs';
import { ScheduleTabs } from './components/ScheduleTabs';
import { Schedule } from '@/hooks/use-schedules';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

const EmployeeScheduleView: React.FC = () => {
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const {
    currentDate,
    setCurrentDate,
    selectedScheduleId,
    setSelectedScheduleId,
    isInfoDialogOpen,
    setIsInfoDialogOpen,
    isCancelDialogOpen,
    setIsCancelDialogOpen,
    activeTab,
    setActiveTab,
    newSchedules,
    schedules,
    isLoading,
    refreshSchedules
  } = useEmployeeSchedule();

  const handleEmailClick = (schedule: Schedule) => {
    const subject = `Regarding shift on ${format(new Date(schedule.start_time), 'MMMM d, yyyy')}`;
    const body = `Hello,\n\nI would like to discuss my shift scheduled for ${format(new Date(schedule.start_time), 'MMMM d, yyyy')} from ${format(new Date(schedule.start_time), 'h:mm a')} to ${format(new Date(schedule.end_time), 'h:mm a')}.`;
    window.location.href = `mailto:manager@workplace.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleResponseComplete = () => {
    refreshSchedules();
    
    if (activeTab === 'pending') {
      const pendingShifts = schedules.filter(s => s.status === 'pending');
      if (pendingShifts.length <= 1) {
        setActiveTab('my-shifts');
      }
    }
  };

  const selectedSchedule = selectedScheduleId 
    ? schedules.find(s => s.id === selectedScheduleId) 
    : null;

  const handleRefresh = () => {
    refreshSchedules();
    toast({
      title: "Refreshing schedule",
      description: "Your schedule is being updated with the latest information."
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-pulse flex flex-col items-center justify-center">
          <div className="w-full h-40 bg-gray-200 rounded-md mb-4"></div>
          <div className="w-3/4 h-6 bg-gray-200 rounded-md mb-2"></div>
          <div className="w-1/2 h-6 bg-gray-200 rounded-md"></div>
        </div>
        <p className="mt-4 text-gray-500">Loading your schedule...</p>
      </div>
    );
  }

  return (
    <div className={cn("pb-6 max-w-full mx-auto", isMobile ? "px-0" : "")}>
      {/* Calendar view at the top */}
      <WeeklyCalendarView
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        schedules={schedules}
      />
      
      <div className="mt-4 border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center px-4 pb-4">
          <h2 className="text-xl font-semibold">Your Shifts</h2>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </Button>
        </div>

        <ScheduleTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          schedules={schedules}
          newSchedules={newSchedules}
          onInfoClick={setSelectedScheduleId}
          onEmailClick={handleEmailClick}
          onCancelClick={(id) => {
            setSelectedScheduleId(id);
            setIsCancelDialogOpen(true);
          }}
          onResponseComplete={handleResponseComplete}
        />

        <ScheduleDialogs
          selectedSchedule={selectedSchedule}
          isInfoDialogOpen={isInfoDialogOpen}
          setIsInfoDialogOpen={setIsInfoDialogOpen}
          isCancelDialogOpen={isCancelDialogOpen}
          setIsCancelDialogOpen={setIsCancelDialogOpen}
        />
      </div>
    </div>
  );
};

export default EmployeeScheduleView;
