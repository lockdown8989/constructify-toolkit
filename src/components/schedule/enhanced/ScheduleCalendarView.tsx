import React, { useState } from 'react';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Mail, Info, X, Check, Clock, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Schedule } from '@/types/supabase/schedules';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/use-auth';
import { useUserRole } from '@/hooks/auth/useUserRole';

interface ScheduleCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  schedules: Schedule[];
  onShiftAction: (scheduleId: string, action: 'confirm' | 'cancel') => void;
  isLoading?: boolean;
}

type ViewType = 'list' | 'month';

export const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  currentDate,
  onDateChange,
  schedules,
  onShiftAction,
  isLoading = false
}) => {
  const { user } = useAuth();
  const { isManager } = useUserRole();
  const [view, setView] = useState<ViewType>('list');

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-700 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-700 bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'text-red-700 bg-red-50 border-red-200';
      default:
        return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    return (
      <div className="bg-white rounded-lg overflow-hidden">
        <div className="grid grid-cols-7 gap-px bg-gray-200 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-xs font-medium text-gray-500 text-center py-2">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px bg-gray-200">
          {days.map((day, i) => {
            const daySchedules = schedules.filter(s => isSameDay(new Date(s.start_time), day));
            const isToday = isSameDay(day, new Date());
            const isSelected = isSameDay(day, currentDate);
            const dayNumber = day.getDate();
            
            if (i === 0) {
              const firstDayOfWeek = day.getDay();
              const placeholders = Array.from({ length: firstDayOfWeek }).map((_, index) => (
                <div key={`empty-${index}`} className="h-28 bg-gray-50 p-2"></div>
              ));
              if (placeholders.length > 0) {
                return [
                  ...placeholders,
                  <div 
                    key={day.toISOString()} 
                    className={cn(
                      "h-28 bg-white p-2 transition-all relative",
                      isToday && "bg-blue-50",
                      isSelected && "ring-2 ring-primary ring-inset"
                    )}
                    onClick={() => onDateChange(day)}
                  >
                    <div className={cn(
                      "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs",
                      isToday && "bg-primary text-white",
                      !isToday && "text-gray-700"
                    )}>
                      {dayNumber}
                    </div>
                    {daySchedules.length > 0 && (
                      <div className="mt-1 max-h-[80px] overflow-y-auto text-xs">
                        {daySchedules.map((schedule) => (
                          <div 
                            key={schedule.id} 
                            className={cn(
                              "mb-1 p-1 rounded text-xs truncate",
                              getStatusColor(schedule.status)
                            )}
                          >
                            {format(new Date(schedule.start_time), 'HH:mm')} - {schedule.title}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ];
              }
            }
            
            return (
              <div 
                key={day.toISOString()} 
                className={cn(
                  "h-28 bg-white p-2 transition-all relative cursor-pointer",
                  isToday && "bg-blue-50",
                  isSelected && "ring-2 ring-primary ring-inset"
                )}
                onClick={() => onDateChange(day)}
              >
                <div className={cn(
                  "inline-flex items-center justify-center w-6 h-6 rounded-full text-xs",
                  isToday && "bg-primary text-white",
                  !isToday && "text-gray-700"
                )}>
                  {dayNumber}
                </div>
                {daySchedules.length > 0 && (
                  <div className="mt-1 max-h-[80px] overflow-y-auto text-xs">
                    {daySchedules.map((schedule) => (
                      <div 
                        key={schedule.id} 
                        className={cn(
                          "mb-1 p-1 rounded text-xs truncate",
                          getStatusColor(schedule.status)
                        )}
                      >
                        {format(new Date(schedule.start_time), 'HH:mm')} - {schedule.title}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="bg-blue-500 p-4 text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            <h2 className="font-semibold text-lg">MY SCHEDULE</h2>
          </div>
          <div className="text-sm">
            {format(currentDate, 'MMMM yyyy')}
          </div>
        </div>
      </div>

      <Tabs defaultValue="my-shifts" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="my-shifts"
            className={cn(
              "relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4",
              "data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-500"
            )}
          >
            My Shifts
          </TabsTrigger>
          <TabsTrigger
            value="open-shifts"
            className={cn(
              "relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4",
              "data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-500"
            )}
          >
            Open Shifts
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className={cn(
              "relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4",
              "data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-500"
            )}
          >
            Pending
            {schedules.filter(s => s.status === 'pending').length > 0 && (
              <Badge variant="default" className="ml-2 bg-orange-100 text-orange-700">
                {schedules.filter(s => s.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className={cn(
              "relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4",
              "data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-500"
            )}
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Clock className="h-5 w-5 animate-spin text-blue-500 mr-2" />
                <span>Loading shifts...</span>
              </div>
            ) : schedules.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No shifts found for this period
              </div>
            ) : (
              schedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={cn(
                    "p-4 rounded-lg border transition-all hover:shadow-sm",
                    schedule.status === 'confirmed' ? "border-green-200 bg-green-50" :
                    schedule.status === 'pending' ? "border-orange-200 bg-orange-50" :
                    "border-gray-200 bg-white"
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-14 h-14 rounded-lg flex flex-col items-center justify-center",
                        schedule.status === 'confirmed' ? "bg-green-100 text-green-700" :
                        schedule.status === 'pending' ? "bg-orange-100 text-orange-700" :
                        "bg-gray-100 text-gray-700"
                      )}>
                        <span className="text-xs font-medium">
                          {format(new Date(schedule.start_time), 'MMM').toUpperCase()}
                        </span>
                        <span className="text-lg font-bold">
                          {format(new Date(schedule.start_time), 'd')}
                        </span>
                      </div>
                      <div>
                        <div className="text-lg font-semibold">
                          {format(new Date(schedule.start_time), 'HH:mm')} → {format(new Date(schedule.end_time), 'HH:mm')}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          {schedule.location || 'Main Location'}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <Mail className="h-4 w-4" />
                      </Button>
                      {schedule.status === 'pending' && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          className="h-8"
                          onClick={() => onShiftAction(schedule.id, 'cancel')}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
