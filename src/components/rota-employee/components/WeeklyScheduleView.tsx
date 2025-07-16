
import React, { useState, useEffect } from 'react';
import { format, startOfWeek, addDays, addWeeks, subWeeks, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useSchedules } from '@/hooks/use-schedules';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface WeeklyScheduleViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  currentDate,
  onDateChange
}) => {
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(currentDate, { weekStartsOn: 1 }));
  const { data: schedules = [], refetch } = useSchedules();
  const { toast } = useToast();

  // Days of the week starting from Monday
  const daysOfWeek = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i));

  useEffect(() => {
    setCurrentWeek(startOfWeek(currentDate, { weekStartsOn: 1 }));
  }, [currentDate]);

  const handlePrevWeek = () => {
    const newWeek = subWeeks(currentWeek, 1);
    setCurrentWeek(newWeek);
    onDateChange(newWeek);
  };

  const handleNextWeek = () => {
    const newWeek = addWeeks(currentWeek, 1);
    setCurrentWeek(newWeek);
    onDateChange(newWeek);
  };

  const getSchedulesForDay = (day: Date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.start_time);
      return isSameDay(scheduleDate, day);
    });
  };

  const handleDeleteShift = async (shiftId: string, shiftTitle: string) => {
    if (!window.confirm(`Are you sure you want to delete the "${shiftTitle}" shift?`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', shiftId);

      if (error) throw error;

      toast({
        title: "Shift Deleted",
        description: `Successfully deleted "${shiftTitle}" shift.`,
      });

      // Refresh the schedules
      refetch();
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast({
        title: "Error",
        description: "Failed to delete shift. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatTimeRange = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    return `${format(start, 'HH:mm')} - ${format(end, 'HH:mm')}`;
  };

  return (
    <div className="space-y-6">
      {/* Week Navigation */}
      <div className="flex items-center justify-between">
        <Button variant="outline" size="icon" onClick={handlePrevWeek}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="text-center">
          <h2 className="text-lg font-semibold">
            {format(currentWeek, 'MMM d')} - {format(addDays(currentWeek, 6), 'MMM d, yyyy')}
          </h2>
        </div>
        
        <Button variant="outline" size="icon" onClick={handleNextWeek}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7 gap-4">
        {weekDays.map((day, index) => {
          const dayName = daysOfWeek[index];
          const daySchedules = getSchedulesForDay(day);
          
          return (
            <Card key={index} className="min-h-[300px]">
              <CardContent className="p-4">
                {/* Day Header */}
                <div className="text-center mb-4">
                  <div className="flex items-center justify-center mb-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  </div>
                  <h3 className="font-medium text-lg capitalize">{dayName}</h3>
                  <p className="text-sm text-gray-600">
                    {daySchedules.length > 0 ? formatTimeRange(daySchedules[0]?.start_time, daySchedules[0]?.end_time) : '09:00:00 - 17:00:00'}
                  </p>
                </div>

                {/* Shifts for the day */}
                <div className="space-y-3">
                  {daySchedules.map((schedule) => (
                    <div key={schedule.id} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center mb-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-blue-700">
                              {formatTimeRange(schedule.start_time, schedule.end_time)}
                            </span>
                          </div>
                          <p className="text-sm font-medium">{schedule.title}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteShift(schedule.id, schedule.title)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {/* Add button */}
                  <Button 
                    variant="outline" 
                    className="w-full border-dashed border-gray-300 text-gray-500 hover:text-gray-700"
                    size="lg"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyScheduleView;
