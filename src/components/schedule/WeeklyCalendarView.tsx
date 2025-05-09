
import React, { useEffect, useState } from 'react';
import { format, addDays, startOfWeek, isSameDay, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { type Schedule } from '@/hooks/use-schedules';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScheduleGridView from './components/ScheduleGridView';

interface WeeklyCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  schedules: Schedule[];
}

const WeeklyCalendarView: React.FC<WeeklyCalendarViewProps> = ({
  currentDate,
  onDateChange,
  schedules
}) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true);
  const startDate = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
  const [view, setView] = useState<'calendar' | 'grid'>('grid');
  
  const weekDays = Array.from({ length: 7 }).map((_, index) => {
    const date = addDays(startDate, index);
    const daySchedules = schedules.filter(schedule => 
      isSameDay(new Date(schedule.start_time), date)
    );
    
    const hasShift = daySchedules.length > 0;
    
    return {
      date,
      dayName: format(date, 'EEE'),
      dayNumber: format(date, 'd'),
      hasShift,
      schedules: daySchedules,
      isToday: isSameDay(date, new Date()),
      isCurrentMonth: isSameMonth(date, currentDate)
    };
  });

  const handlePreviousWeek = () => {
    onDateChange(addDays(startDate, -7));
  };

  const handleNextWeek = () => {
    onDateChange(addDays(startDate, 7));
  };

  const handleShiftSwapRequest = (schedule: Schedule) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to request shift swaps.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Navigate to the schedule requests page with state information
      navigate('/schedule-requests', { 
        state: { 
          activeTab: 'shift-swaps',
          initialSchedule: {
            id: schedule.id,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            title: schedule.title
          }
        } 
      });
    } catch (error) {
      console.error("Navigation error:", error);
      toast({
        title: "Navigation error",
        description: "There was a problem navigating to the schedule requests page.",
        variant: "destructive"
      });
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">MY SCHEDULE</h1>
        <div className="text-sm">{format(currentDate, 'EEE dd, MMMM yyyy').toUpperCase()}</div>
      </div>

      <CollapsibleContent>
        <div className="bg-white border-b">
          <Tabs value={view} onValueChange={(v) => setView(v as 'calendar' | 'grid')}>
            <TabsList className="w-full justify-start border-b px-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="calendar">Calendar View</TabsTrigger>
            </TabsList>
            
            <TabsContent value="calendar" className="p-4">
              <div className="flex justify-between items-center mb-4">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handlePreviousWeek}
                  className="text-gray-600"
                >
                  <ChevronLeft className="h-6 w-6" />
                </Button>
                
                <div className="font-medium">
                  {format(startDate, 'MMMM yyyy')}
                </div>
                
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={handleNextWeek}
                  className="text-gray-600"
                >
                  <ChevronRight className="h-6 w-6" />
                </Button>
              </div>
              
              <div className="grid grid-cols-7 gap-2 text-center">
                {weekDays.map(({ date, dayName, dayNumber, hasShift, schedules: daySchedules, isToday, isCurrentMonth }) => (
                  <div 
                    key={date.toString()} 
                    className={cn(
                      "p-2 relative cursor-pointer rounded-lg transition-colors",
                      isToday && "bg-blue-50",
                      !isCurrentMonth && "text-gray-400",
                      "hover:bg-gray-50"
                    )}
                    onClick={() => onDateChange(date)}
                  >
                    <div className="text-sm text-gray-600">{dayName}</div>
                    <div className={cn(
                      "text-lg font-semibold",
                      isToday && "text-blue-600",
                      !isCurrentMonth && "text-gray-400"
                    )}>
                      {dayNumber}
                    </div>
                    {hasShift && daySchedules.map((schedule) => (
                      <TooltipProvider key={schedule.id}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="mt-1 flex justify-center">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="p-1 h-6 flex items-center gap-1 text-xs bg-green-100 hover:bg-green-200 text-green-800"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleShiftSwapRequest(schedule);
                                }}
                              >
                                <ArrowLeftRight className="h-3 w-3" />
                                <span>Swap</span>
                              </Button>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Request shift swap for {format(new Date(schedule.start_time), 'h:mm a')}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ))}
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="grid" className="pt-0">
              <ScheduleGridView 
                currentDate={currentDate}
                onDateChange={onDateChange}
                schedules={schedules}
              />
            </TabsContent>
          </Tabs>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default WeeklyCalendarView;
