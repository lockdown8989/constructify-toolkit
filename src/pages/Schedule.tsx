
import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useEmployees } from '@/hooks/use-employees';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useSchedules, useCreateSchedule } from '@/hooks/use-schedules';
import ScheduleList from '@/components/schedule/ScheduleList';
import ScheduleCalendar from '@/components/schedule/ScheduleCalendar';
import { Button } from '@/components/ui/button';
import { PlusCircle, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Meeting {
  id: string;
  title: string;
  time: string;
  participants: string[];
  location?: string;
}

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
  const [isAddScheduleOpen, setIsAddScheduleOpen] = useState(false);
  const [newSchedule, setNewSchedule] = useState({
    title: '',
    employeeId: '',
    startTime: '',
    endTime: ''
  });
  
  const { data: schedules = [], isLoading: schedulesLoading, refetch: refetchSchedules } = useSchedules(date);
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
        end_time: `${selectedDate}T${newSchedule.endTime}:00`
      };
      
      const result = await createSchedule(schedule);
      
      if (result) {
        setNewSchedule({
          title: '',
          employeeId: '',
          startTime: '',
          endTime: ''
        });
        setIsAddScheduleOpen(false);
        refetchSchedules();
      }
    } catch (error: any) {
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
                          {format(new Date(schedule.start_time), 'h:mm a')}
                        </span>
                        <span className="flex-1">{schedule.title}</span>
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
              <div className="bg-white rounded-3xl p-6 card-shadow">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-medium">Meeting Schedule</h3>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={handleAddMeeting}
                  >
                    <PlusCircle className="mr-1 h-4 w-4" />
                    <span className="hidden sm:inline">Add Meeting</span>
                  </Button>
                </div>
                
                <div className="space-y-4">
                  {SAMPLE_MEETINGS.map(meeting => {
                    const [meetingDate] = meeting.time.split(" ");
                    const isToday = meetingDate === format(new Date(), 'yyyy-MM-dd');
                    const isTomorrow = meetingDate === format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd');
                    const isAfterTomorrow = meetingDate === format(new Date(new Date().setDate(new Date().getDate() + 2)), 'yyyy-MM-dd');
                    
                    if (!isToday && !isTomorrow && !isAfterTomorrow) return null;
                    
                    return (
                      <div 
                        key={meeting.id}
                        className="bg-white p-3 rounded-lg shadow-sm border border-gray-100"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium">{meeting.title}</h4>
                          <div className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded">
                            {isToday ? "Today" : isTomorrow ? "Tomorrow" : "In 2 days"}
                          </div>
                        </div>
                        
                        <div className="flex items-center text-gray-500 text-xs mb-2">
                          <Clock className="h-3 w-3 mr-1" />
                          {meeting.time.split(" ")[1]}
                        </div>
                        
                        {meeting.location && (
                          <div className="text-sm text-gray-500 mb-2">
                            {meeting.location}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
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
        
        <TabsContent value="interactive">
          <ScheduleCalendar />
        </TabsContent>
      </Tabs>
      
      <Dialog open={isAddScheduleOpen} onOpenChange={setIsAddScheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Schedule</DialogTitle>
            <DialogDescription>
              Create a new schedule for an employee on {date ? format(date, 'MMMM d, yyyy') : 'the selected date'}.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={newSchedule.title}
                onChange={(e) => setNewSchedule({ ...newSchedule, title: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="employee" className="text-right">
                Employee
              </Label>
              <Select 
                value={newSchedule.employeeId} 
                onValueChange={(value) => setNewSchedule({ ...newSchedule, employeeId: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select an employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map(employee => (
                    <SelectItem key={employee.id} value={employee.id}>
                      {employee.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input
                id="startTime"
                type="time"
                value={newSchedule.startTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, startTime: e.target.value })}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Input
                id="endTime"
                type="time"
                value={newSchedule.endTime}
                onChange={(e) => setNewSchedule({ ...newSchedule, endTime: e.target.value })}
                className="col-span-3"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddScheduleOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitSchedule}>
              Create Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SchedulePage;
