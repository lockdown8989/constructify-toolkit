
import React from 'react';
import { format } from 'date-fns';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import { Check, ChevronLeft, ChevronRight, RefreshCw, Calendar } from 'lucide-react';
import WeeklyCalendarView from '@/components/schedule/WeeklyCalendarView';
import { ScheduleDialogs } from './components/ScheduleDialogs';
import { ScheduleTabs } from './components/ScheduleTabs';
import { Schedule } from '@/hooks/use-schedules';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-4">
            <RefreshCw className="w-5 h-5 animate-spin text-primary" />
            <p>Loading your schedule...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const pendingCount = schedules.filter(s => s.status === 'pending').length;
  const upcomingShifts = schedules.filter(s => 
    new Date(s.start_time) > new Date() && 
    s.status === 'confirmed'
  ).length;

  return (
    <div className="space-y-6 pb-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Your Schedule</CardTitle>
              <CardDescription>Manage your upcoming shifts and requests</CardDescription>
            </div>
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
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Upcoming Shifts</p>
                    <h3 className="text-2xl font-bold">{upcomingShifts}</h3>
                  </div>
                  <Calendar className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Pending Requests</p>
                    <h3 className="text-2xl font-bold">{pendingCount}</h3>
                  </div>
                  <Badge variant={pendingCount > 0 ? "destructive" : "secondary"}>
                    {pendingCount > 0 ? 'Action Needed' : 'All Clear'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <WeeklyCalendarView
            currentDate={currentDate}
            onDateChange={setCurrentDate}
            schedules={schedules}
          />
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-0">
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
        </CardContent>
      </Card>

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
