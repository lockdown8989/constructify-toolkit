
import React from 'react';
import { format, isSameDay } from 'date-fns';
import { Calendar, ChevronLeft, ChevronRight, Mail, Info, X } from 'lucide-react';
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
}

export const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  currentDate,
  onDateChange,
  schedules,
  onShiftAction
}) => {
  const { user } = useAuth();
  const { isManager } = useUserRole();
  
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      {/* Header with navigation */}
      <div className="p-4 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <h2 className="font-semibold text-lg">My Schedule</h2>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-medium">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="my-shifts" className="w-full">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
          <TabsTrigger
            value="my-shifts"
            className={cn(
              "relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4",
              "data-[state=active]:border-b-primary data-[state=active]:text-primary"
            )}
          >
            My Shifts
          </TabsTrigger>
          <TabsTrigger
            value="open-shifts"
            className={cn(
              "relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4",
              "data-[state=active]:border-b-primary data-[state=active]:text-primary"
            )}
          >
            Open Shifts
          </TabsTrigger>
          <TabsTrigger
            value="pending"
            className={cn(
              "relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4",
              "data-[state=active]:border-b-primary data-[state=active]:text-primary"
            )}
          >
            Pending
            {schedules.filter(s => s.status === 'pending').length > 0 && (
              <Badge variant="destructive" className="ml-2">
                {schedules.filter(s => s.status === 'pending').length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className={cn(
              "relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4",
              "data-[state=active]:border-b-primary data-[state=active]:text-primary"
            )}
          >
            Completed
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="h-[600px]">
          <div className="p-4 space-y-4">
            {schedules.map((schedule) => (
              <div
                key={schedule.id}
                className={cn(
                  "p-4 rounded-lg border",
                  isSameDay(new Date(schedule.start_time), new Date()) && "bg-blue-50 border-blue-200",
                  schedule.status === 'confirmed' && "border-green-200",
                  schedule.status === 'pending' && "border-yellow-200",
                  schedule.status === 'completed' && "border-gray-200"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-12 h-12 rounded-lg flex flex-col items-center justify-center",
                      schedule.status === 'confirmed' ? "bg-green-100 text-green-700" :
                      schedule.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                      "bg-gray-100 text-gray-700"
                    )}>
                      <span className="text-sm font-medium">
                        {format(new Date(schedule.start_time), 'MMM')}
                      </span>
                      <span className="text-lg font-bold">
                        {format(new Date(schedule.start_time), 'd')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium">{schedule.title}</h3>
                      <p className="text-sm text-gray-500">
                        {format(new Date(schedule.start_time), 'HH:mm')} → {format(new Date(schedule.end_time), 'HH:mm')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Info className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                      <Mail className="h-4 w-4" />
                    </Button>
                    {schedule.status === 'pending' && !isManager && (
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
                    {schedule.status === 'pending' && isManager && (
                      <Button 
                        size="sm" 
                        variant="default"
                        className="h-8"
                        onClick={() => onShiftAction(schedule.id, 'confirm')}
                      >
                        Confirm
                      </Button>
                    )}
                  </div>
                </div>
                {schedule.location && (
                  <div className="text-sm text-gray-500 mt-2">
                    📍 {schedule.location}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </Tabs>
    </div>
  );
};
