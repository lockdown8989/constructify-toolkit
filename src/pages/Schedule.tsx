import React, { useState, useEffect } from 'react';
import MeetingSchedule from '@/components/dashboard/MeetingSchedule';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useEmployees } from '@/hooks/use-employees';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSchedules } from '@/hooks/use-schedules';
import ScheduleList from '@/components/schedule/ScheduleList';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';

const SAMPLE_MEETINGS = [
  {
    id: '1',
    title: 'Team Standup',
    time: `${format(new Date(), 'yyyy-MM-dd')} 09:30`,
    participants: ['John Doe', 'Jane Smith', 'Robert Johnson'],
    location: 'Meeting Room A'
  },
  {
    id: '2',
    title: 'Project Review',
    time: `${format(new Date(), 'yyyy-MM-dd')} 14:00`,
    participants: ['Michael Brown', 'Sarah Davis', 'James Wilson'],
    location: 'Conference Room'
  },
  {
    id: '3',
    title: 'Client Presentation',
    time: `${format(new Date().setDate(new Date().getDate() + 1), 'yyyy-MM-dd')} 11:00`,
    participants: ['Emily Taylor', 'David Miller'],
    location: 'Zoom Meeting'
  },
  {
    id: '4',
    title: 'Monthly Review',
    time: `${format(new Date().setDate(new Date().getDate() + 2), 'yyyy-MM-dd')} 10:00`,
    participants: ['John Doe', 'Jane Smith', 'Sarah Davis', 'David Miller'],
    location: 'Meeting Room B'
  }
];

const SchedulePage = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const { data: employees = [] } = useEmployees();
  const { toast } = useToast();
  const { isAdmin, isHR } = useAuth();
  
  const { data: schedules = [], isLoading: schedulesLoading, refetch: refetchSchedules } = useSchedules(date);
  
  const employeeNames = employees.reduce<Record<string, string>>((acc, employee) => {
    acc[employee.id] = employee.name;
    return acc;
  }, {});
  
  const handleAddMeeting = () => {
    toast({
      title: "Feature coming soon",
      description: "The ability to add new meetings will be available soon.",
    });
  };
  
  const handleAddSchedule = async () => {
    if (!isAdmin && !isHR) {
      toast({
        title: "Permission denied",
        description: "Only admins and HR personnel can add schedules.",
        variant: "destructive",
      });
      return;
    }
    
    if (employees.length === 0) {
      toast({
        title: "No employees found",
        description: "Please add employees before creating schedules.",
        variant: "destructive",
      });
      return;
    }
    
    const randomEmployee = employees[Math.floor(Math.random() * employees.length)];
    
    try {
      const { error } = await supabase.from('schedules').insert({
        employee_id: randomEmployee.id,
        date: date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
        task: 'New Task ' + new Date().toLocaleTimeString(),
        time: new Date().toTimeString().split(' ')[0],
        status: 'Pending'
      });
      
      if (error) throw error;
      
      toast({
        title: "Schedule created",
        description: "A new schedule has been added.",
      });
      
      refetchSchedules();
    } catch (error: any) {
      toast({
        title: "Failed to create schedule",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Schedule & Calendar</h1>
      
      <Tabs defaultValue="calendar">
        <TabsList className="mb-6">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="schedule">Daily Schedule</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white rounded-3xl p-6 card-shadow">
              <h2 className="text-xl font-medium mb-4">Company Calendar</h2>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="w-full"
              />
              
              <div className="mt-4">
                <h3 className="font-medium text-lg mb-2">
                  {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
                </h3>
                {schedulesLoading ? (
                  <p>Loading schedules...</p>
                ) : schedules.length > 0 ? (
                  <ul className="space-y-2">
                    {schedules.map(schedule => (
                      <li key={schedule.id} className="flex items-center">
                        <span className="w-16 text-sm text-gray-500">
                          {format(new Date(`${schedule.date}T${schedule.time}`), 'h:mm a')}
                        </span>
                        <span className="flex-1">{schedule.task}</span>
                        <span className="text-sm text-gray-500">
                          {employeeNames[schedule.employee_id] || 'Unknown'}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No schedules for this date</p>
                )}
                
                {(isAdmin || isHR) && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-4" 
                    onClick={handleAddSchedule}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Schedule
                  </Button>
                )}
              </div>
            </div>
            
            <div className="md:col-span-1">
              <MeetingSchedule 
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
            
            <div className="bg-white rounded-3xl p-6 card-shadow">
              <h2 className="text-xl font-medium mb-4">Upcoming Events</h2>
              <div className="space-y-4">
                {SAMPLE_MEETINGS.map(meeting => (
                  <div 
                    key={meeting.id}
                    className="flex items-start border-l-4 border-blue-500 pl-4 py-2"
                  >
                    <div>
                      <h3 className="font-medium">{meeting.title}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(meeting.time.replace(' ', 'T')), 'MMMM d, yyyy • h:mm a')}
                      </p>
                      <p className="text-sm text-gray-500">{meeting.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulePage;
