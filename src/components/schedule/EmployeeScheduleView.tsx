
import React from 'react';
import { format } from 'date-fns';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import { RefreshCw } from 'lucide-react';
import WeeklyCalendarView from '@/components/schedule/WeeklyCalendarView';
import { ScheduleDialogs } from './components/ScheduleDialogs';
import { ScheduleTabs } from './components/ScheduleTabs';
import { Schedule } from '@/hooks/use-schedules';
import { Button } from '@/components/ui/button';
import { useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const EmployeeScheduleView: React.FC = () => {
  const location = useLocation();
  const { toast } = useToast();
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

  if (isLoading) {
    return <div className="p-4 text-center">Loading schedule...</div>;
  }

  return (
    <div className="pb-6 max-w-full mx-auto">
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
            onClick={refreshSchedules}
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
