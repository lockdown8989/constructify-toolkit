
import React, { useState, useMemo, useEffect } from 'react';
import { format, startOfWeek, addDays, getHours, getMinutes, isToday } from 'date-fns';
import { useSchedules } from '@/hooks/use-schedules';
import { type Schedule } from '@/hooks/use-schedules';
import { cn } from '@/lib/utils';
import { ViewType } from './types/calendar-types';
import CalendarHeader from './components/CalendarHeader';
import DayView from './components/DayView';
import WeekView from './components/WeekView';
import { useAuth } from '@/hooks/use-auth';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useIsMobile } from '@/hooks/use-mobile';

const ScheduleCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<ViewType>('day');
  const { data: schedules = [] } = useSchedules();
  const [currentTimeTop, setCurrentTimeTop] = useState<number>(0);
  const { isAdmin, isManager, isHR } = useAuth();
  const [isAddSheetOpen, setIsAddSheetOpen] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const hasManagerAccess = isAdmin || isManager || isHR;

  // Calculate current time position for the indicator
  useEffect(() => {
    const calculateTimePosition = () => {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      
      // Only show time indicator during work hours (9am-5pm)
      if (hours >= 9 && hours <= 17) {
        const timePosition = (hours - 9) * 60 + minutes;
        setCurrentTimeTop(timePosition);
      } else {
        setCurrentTimeTop(-1); // Hide indicator outside work hours
      }
    };

    calculateTimePosition();
    const interval = setInterval(calculateTimePosition, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const handlePrevious = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, -1));
    } else {
      setCurrentDate(prev => addDays(prev, -7));
    }
  };

  const handleNext = () => {
    if (view === 'day') {
      setCurrentDate(prev => addDays(prev, 1));
    } else {
      setCurrentDate(prev => addDays(prev, 7));
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  const handleAddShift = () => {
    setIsAddSheetOpen(true);
  };
  
  const handleSubmitAddShift = () => {
    toast({
      title: "Shift added",
      description: "New shift has been successfully added to the schedule",
    });
    setIsAddSheetOpen(false);
  };

  const timeSlots = useMemo(() => {
    const slots = [];
    for (let hour = 9; hour <= 17; hour++) {
      const formattedHour = hour > 12 ? `${hour - 12}:00 ${hour >= 12 ? 'PM' : 'AM'}` : `${hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`;
      slots.push(
        <div key={hour} className="flex border-t border-gray-200/70">
          <div className="w-16 pr-2 py-2 text-right text-xs text-gray-500 font-medium">
            {formattedHour}
          </div>
          <div className="flex-grow min-h-[60px] relative" />
        </div>
      );
    }
    return slots;
  }, []);

  const getEventPosition = (schedule: Schedule) => {
    const startTime = new Date(schedule.start_time);
    const endTime = new Date(schedule.end_time);
    
    const startHour = getHours(startTime) + getMinutes(startTime) / 60;
    const endHour = getHours(endTime) + getMinutes(endTime) / 60;
    
    const top = (startHour - 9) * 60; // 9am is our starting hour
    const height = (endHour - startHour) * 60;
    
    return { top, height };
  };

  const getEventColor = (index: number) => {
    const colors = [
      'bg-blue-100/80 border-blue-500 hover:bg-blue-200/80',
      'bg-purple-100/80 border-purple-500 hover:bg-purple-200/80',
      'bg-green-100/80 border-green-500 hover:bg-green-200/80',
      'bg-amber-100/80 border-amber-500 hover:bg-amber-200/80',
      'bg-pink-100/80 border-pink-500 hover:bg-pink-200/80',
    ];
    
    return colors[index % colors.length];
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <CalendarHeader 
          currentDate={currentDate}
          view={view}
          setView={setView}
          handlePrevious={handlePrevious}
          handleNext={handleNext}
          handleToday={handleToday}
          isToday={isToday(currentDate)}
        />
        
        {/* Add shift button for managers */}
        {hasManagerAccess && (
          <Button 
            onClick={handleAddShift}
            size="sm" 
            className="rounded-full h-10 w-10 p-0 bg-blue-500 hover:bg-blue-600 shadow-md"
          >
            <Plus className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      {view === 'day' ? (
        <DayView
          currentDate={currentDate}
          schedules={schedules}
          timeSlots={timeSlots}
          currentTimeTop={currentTimeTop}
          getEventPosition={getEventPosition}
          getEventColor={getEventColor}
        />
      ) : (
        <WeekView 
          currentDate={currentDate}
          schedules={schedules}
          getEventColor={getEventColor}
        />
      )}
      
      {/* Add shift sheet dialog */}
      <Sheet open={isAddSheetOpen} onOpenChange={setIsAddSheetOpen}>
        <SheetContent className={cn(
          isMobile ? "h-[80%] rounded-t-xl pb-0" : "max-w-md",
          "overflow-y-auto"
        )} side={isMobile ? "bottom" : "right"}>
          <SheetHeader className="pb-4">
            <SheetTitle>Add New Shift</SheetTitle>
            <SheetDescription>Create a new shift on the schedule</SheetDescription>
          </SheetHeader>
          
          <div className="space-y-4 pb-20">
            <div className="space-y-2">
              <Label htmlFor="employee">Employee</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Select an employee</option>
                <option value="emp1">Courtney Henry</option>
                <option value="emp2">Alex Jackson</option>
                <option value="emp3">Leslie Alexander</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shift-date">Date</Label>
              <Input 
                type="date" 
                id="shift-date" 
                defaultValue={format(currentDate, 'yyyy-MM-dd')} 
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="start-time">Start Time</Label>
                <Input type="time" id="start-time" defaultValue="09:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-time">End Time</Label>
                <Input type="time" id="end-time" defaultValue="17:00" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shift-role">Role</Label>
              <select className="w-full p-2 border rounded-md">
                <option value="">Select a role</option>
                <option value="waitstaff">Waiting Staff</option>
                <option value="chef">Chef</option>
                <option value="hostess">Host/Hostess</option>
                <option value="manager">Duty Manager</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <textarea 
                id="notes"
                className="w-full p-2 border rounded-md min-h-[80px]"
                placeholder="Add any notes about this shift"
              />
            </div>
          </div>
          
          <div className={cn(
            "flex gap-2 pt-4 border-t bg-white",
            isMobile ? "fixed bottom-0 left-0 right-0 p-4" : "mt-4"
          )}>
            <Button 
              variant="outline" 
              onClick={() => setIsAddSheetOpen(false)} 
              className="flex-1"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitAddShift} 
              className="flex-1"
            >
              Add Shift
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default ScheduleCalendar;
