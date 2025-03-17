
import React, { useState } from 'react';
import MeetingSchedule from '@/components/dashboard/MeetingSchedule';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { useEmployees } from '@/hooks/use-employees';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

// Sample meeting data - in a real app, this would come from an API or database
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
            <MeetingSchedule 
              meetings={SAMPLE_MEETINGS}
              onAddMeeting={handleAddMeeting}
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
