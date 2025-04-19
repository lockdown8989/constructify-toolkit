
import React from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import { Check, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import WeeklyCalendarView from '@/components/schedule/WeeklyCalendarView';
import { ScheduleDialogs } from './components/ScheduleDialogs';
import { ScheduleTabs } from './components/ScheduleTabs';
import { Schedule } from '@/hooks/use-schedules';
import { Button } from '@/components/ui/button';

const EmployeeScheduleView: React.FC = () => {
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

  const selectedSchedule = selectedScheduleId 
    ? schedules.find(s => s.id === selectedScheduleId) 
    : null;

  if (isLoading) {
    return <div className="p-4 text-center">Loading schedule...</div>;
  }

  return (
    <div className="pb-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center px-4 pt-2 pb-4">
        <h2 className="text-xl font-semibold">Your Schedule</h2>
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
      
      <WeeklyCalendarView
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        schedules={schedules}
      />
      
      {/* Calendar Navigation */}
      <div className="flex justify-between items-center p-4 bg-white">
        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))} className="p-2">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
        <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))} className="p-2">
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>
      
      <div className="border-t border-gray-200 my-2" />

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
        onResponseComplete={refreshSchedules}
      />

      <ScheduleDialogs
        selectedSchedule={selectedSchedule}
        isInfoDialogOpen={isInfoDialogOpen}
        setIsInfoDialogOpen={setIsInfoDialogOpen}
        isCancelDialogOpen={isCancelDialogOpen}
        setIsCancelDialogOpen={setIsCancelDialogOpen}
      />
    </div>
  );
};

export default EmployeeScheduleView;
