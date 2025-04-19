import React, { useState } from 'react';
import { format } from 'date-fns';
import { useEmployees } from '@/hooks/use-employees';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSchedules, useCreateSchedule } from '@/hooks/use-schedules';
import ScheduleList from '@/components/schedule/ScheduleList';
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar';
import { SAMPLE_MEETINGS } from '@/data/sample-meetings';
import ScheduleCalendarView from '@/components/schedule/ScheduleCalendarView';
import MeetingSidePanel from '@/components/schedule/MeetingSidePanel';
import UpcomingEventsPanel from '@/components/schedule/UpcomingEventsPanel';
import ScheduleFormDialog from '@/components/schedule/ScheduleFormDialog';
import { useAuth } from '@/hooks/auth';

const SchedulePage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { data: employees = [] } = useEmployees();
  const { toast } = useToast();
  const { isAdmin, isHR } = useAuth();
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    employeeId: '',
    startTime: '',
    endTime: ''
  });
  
  const { data: schedules = [], isLoading: schedulesLoading, refetch: refetchSchedules } = useSchedules();
  const { createSchedule } = useCreateSchedule();
  
  const employeeNames = employees.reduce<Record<string, string>>((acc, employee) => {
    acc[employee.id] = employee.name;
    return acc;
  }, {});
  
  const handleAddSchedule = async () => {
    if (!isAdmin && !isHR) {
      toast({
        title: "Permission denied",
        description: "Only admins and HR personnel can add schedules.",
        variant: "destructive",
      });
      return;
    }
    
    setIsAddScheduleOpen(true);
  };
  
  const handleSubmitSchedule = async () => {
    if (!newSchedule.title || !newSchedule.employeeId || !newSchedule.startTime || !newSchedule.endTime) {
      toast({
        title: "Invalid schedule details",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const selectedDate = date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
      
      const schedule = {
        employee_id: newSchedule.employeeId,
        title: newSchedule.title,
        start_time: `${selectedDate}T${newSchedule.startTime}:00`,
        end_time: `${selectedDate}T${newSchedule.endTime}:00`,
        status: 'confirmed'
      };
      
      await createSchedule.mutateAsync(schedule);
      
      setNewSchedule({
        title: '',
        employeeId: '',
        startTime: '',
        endTime: ''
      });
      setIsAddScheduleOpen(false);
      refetchSchedules();
      
      toast({
        title: "Schedule created",
        description: "The shift has been successfully added.",
      });
    } catch (error: any) {
      console.error('Error creating schedule:', error);
      toast({
        title: "Failed to create schedule",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  const handleAddMeeting = () => {
    toast({
      title: "Feature coming soon",
      description: "The ability to add new meetings will be available soon.",
    });
  };
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Schedule & Calendar</h1>
      
      <Tabs defaultValue="calendar">
        <TabsList className="mb-6">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
          <TabsTrigger value="interactive">Interactive Calendar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <ScheduleCalendarView
                date={date}
                setDate={setDate}
                schedules={schedules}
                schedulesLoading={schedulesLoading}
                employeeNames={employeeNames}
                onAddSchedule={handleAddSchedule}
                isAdmin={isAdmin}
                isHR={isHR}
              />
            </div>
            
            <div className="md:col-span-1">
              <MeetingSidePanel 
                meetings={SAMPLE_MEETINGS}
                onAddMeeting={handleAddMeeting}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="schedule">
          <div className="space-y-6">
            <ScheduleList 
              schedules={schedules} 
              onAddSchedule={handleAddSchedule}
              employeeNames={employeeNames}
              className="w-full"
            />
            
            <UpcomingEventsPanel meetings={SAMPLE_MEETINGS} />
          </div>
        </TabsContent>
        
        <TabsContent value="interactive">
          <ScheduleCalendar />
        </TabsContent>
      </Tabs>
      
      <ScheduleFormDialog
        isOpen={isAddScheduleOpen}
        setIsOpen={setIsAddScheduleOpen}
        newSchedule={newSchedule}
        setNewSchedule={setNewSchedule}
        handleSubmit={handleSubmitSchedule}
        employees={employees}
        date={date}
      />
    </div>
  );
};

export default SchedulePage;
