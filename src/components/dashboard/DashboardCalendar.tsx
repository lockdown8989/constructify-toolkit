
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CalendarClock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const DashboardCalendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const isMobile = useIsMobile();
  
  // Example upcoming events
  const events = [
    { date: new Date(), title: "Morning Shift", time: "8:00 AM - 4:00 PM", type: "work" },
    { date: new Date(new Date().setDate(new Date().getDate() + 2)), title: "Team Meeting", time: "10:00 AM - 11:00 AM", type: "meeting" },
    { date: new Date(new Date().setDate(new Date().getDate() + 4)), title: "Evening Shift", time: "4:00 PM - 12:00 AM", type: "work" },
  ];
  
  // Filter events for the selected date
  const todayEvents = events.filter(event => 
    date && event.date.getDate() === date.getDate() && 
    event.date.getMonth() === date.getMonth() &&
    event.date.getFullYear() === date.getFullYear()
  );
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Schedule</CardTitle>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium">
              {date ? format(date, 'MMMM yyyy') : ''}
            </span>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div className={cn("col-span-1", !isMobile && "md:col-span-5")}>
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border"
            />
          </div>
          
          <div className={cn("col-span-1", !isMobile && "md:col-span-2")}>
            <div className="bg-gray-50 rounded-md p-3 h-full">
              <div className="flex items-center mb-3">
                <CalendarClock className="h-4 w-4 mr-2 text-gray-600" />
                <h3 className="font-medium text-sm">
                  {date ? format(date, 'MMMM d, yyyy') : 'Select a date'}
                </h3>
              </div>
              
              {todayEvents.length > 0 ? (
                <div className="space-y-2">
                  {todayEvents.map((event, index) => (
                    <div 
                      key={index} 
                      className={cn(
                        "bg-white p-2 rounded border-l-4",
                        event.type === 'work' ? "border-l-blue-500" : "border-l-green-500"
                      )}
                    >
                      <div className="font-medium text-sm">{event.title}</div>
                      <div className="text-xs text-gray-500">{event.time}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">No events scheduled</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCalendar;
