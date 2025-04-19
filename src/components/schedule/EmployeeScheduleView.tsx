
import React from 'react';
import { format } from 'date-fns';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import WeeklyCalendarView from '@/components/schedule/WeeklyCalendarView';
import { ScheduleDialogs } from './components/ScheduleDialogs';
import { ScheduleTabs } from './components/ScheduleTabs';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { Schedule } from '@/types/schedule.types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

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
    refreshSchedules,
  } = useEmployeeSchedule();

  const handleEmailClick = async (schedule: Schedule) => {
    const subject = `Regarding shift on ${format(new Date(schedule.start_time), 'MMMM d, yyyy')}`;
    const body = `Hello,\n\nI would like to discuss my shift scheduled for ${format(new Date(schedule.start_time), 'MMMM d, yyyy')} from ${format(new Date(schedule.start_time), 'h:mm a')} to ${format(new Date(schedule.end_time), 'h:mm a')}.`;
    window.location.href = `mailto:manager@workplace.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-4">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
            <p>Loading your schedule...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      <Card className="bg-white">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">My Schedule</CardTitle>
              <CardDescription className="text-blue-100">View and manage your upcoming shifts</CardDescription>
            </div>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={refreshSchedules}
              className="bg-white/10 hover:bg-white/20 text-white"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[calc(100vh-12rem)]">
            <WeeklyCalendarView
              currentDate={currentDate}
              onDateChange={setCurrentDate}
              schedules={schedules}
            />
          </div>
          
          <div className="border-t">
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
            />
          </div>
        </CardContent>
      </Card>

      <ScheduleDialogs
        selectedSchedule={schedules.find(s => s.id === selectedScheduleId)}
        isInfoDialogOpen={isInfoDialogOpen}
        setIsInfoDialogOpen={setIsInfoDialogOpen}
        isCancelDialogOpen={isCancelDialogOpen}
        setIsCancelDialogOpen={setIsCancelDialogOpen}
      />
    </div>
  );
};

export default EmployeeScheduleView;
