
import React, { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, isSameDay, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { useShiftCalendarState } from './hooks/useShiftCalendarState';

interface DayProps {
  day: Date;
  month: number;
  year: number;
  schedules: any[];
  onDayClick?: (date: Date) => void;
}

const Day: React.FC<DayProps> = ({ day, month, year, schedules, onDayClick }) => {
  const isToday = isSameDay(day, new Date());
  const dayOfMonth = format(day, 'd');
  const isCurrentMonth = isSameMonth(day, new Date(year, month));
  const daySchedules = schedules.filter(schedule => isSameDay(new Date(schedule.start_time), day));
  
  const handleClick = () => {
    if (onDayClick) {
      onDayClick(day);
    }
  };

  return (
    <div 
      className={cn(
        "w-full border-t border-l cursor-pointer hover:bg-blue-50 transition-colors",
        isToday && "bg-blue-50"
      )}
      onClick={handleClick}
    >
      <div className="p-1.5 text-sm">
        <div className="flex items-center justify-end">
          <span className={cn(
            "text-sm font-medium",
            !isCurrentMonth && "text-gray-400",
            isToday && "text-blue-500"
          )}>
            {dayOfMonth}
          </span>
        </div>
        {daySchedules.map(schedule => (
          <div 
            key={schedule.id}
            className={cn(
              "mt-1 px-1 py-0.5 rounded text-xs",
              schedule.shift_type === 'open_shift' ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"
            )}
          >
            <div className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              <span>{format(new Date(schedule.start_time), 'h:mm a')}</span>
            </div>
            <span className="text-xs">{schedule.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

interface WeekProps {
  weekStart: Date;
  month: number;
  year: number;
  schedules: any[];
  onDayClick?: (date: Date) => void;
}

const Week: React.FC<WeekProps> = ({ weekStart, month, year, schedules, onDayClick }) => {
  const days = eachDayOfInterval({
    start: weekStart,
    end: addMonths(weekStart, 1),
  }).slice(0, 7);

  return (
    <div className="w-full flex">
      {days.map(day => (
        <Day 
          key={day.toISOString()} 
          day={day} 
          month={month} 
          year={year} 
          schedules={schedules}
          onDayClick={onDayClick}
        />
      ))}
    </div>
  );
};

interface ScheduleCalendarProps {
  schedules: any[];
  onDayClick?: (date: Date) => void;
}

const ScheduleCalendar: React.FC<ScheduleCalendarProps> = ({ schedules, onDayClick }) => {
  const { month, year, handleNextMonth, handlePrevMonth } = useShiftCalendarState();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const monthStart = startOfMonth(new Date(year, month));
  const monthEnd = endOfMonth(new Date(year, month));
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarWeeks = eachDayOfInterval({ start: startDate, end: endDate });

  const weeks: Date[] = [];
  for (let i = 0; i < calendarWeeks.length; i += 7) {
    weeks.push(calendarWeeks[i]);
  }

  const handleCalendarDayClick = (date: Date) => {
    if (onDayClick) {
      onDayClick(date);
    }
  };

  return (
    <Card className="border-0 shadow-md rounded-xl overflow-hidden">
      <CardContent className="p-0">
        <div className="md:flex items-center justify-between p-4 md:p-6 border-b">
          <div className="flex items-center">
            <Button
              variant="outline"
              size="icon"
              onClick={handlePrevMonth}
              className="mr-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-semibold">
              {format(new Date(year, month), 'MMMM yyyy')}
            </h2>
            <Button
              variant="outline"
              size="icon"
              onClick={handleNextMonth}
              className="ml-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          {user && (
            <Button onClick={() => navigate('/shift-calendar')} className="ml-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Full Schedule
            </Button>
          )}
        </div>

        <div className="grid grid-cols-7 border-b">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="p-2 text-center text-xs font-medium uppercase text-gray-500 border-t border-r">
              {day}
            </div>
          ))}
        </div>

        <div className="flex flex-col">
          {weeks.map(weekStart => (
            <Week 
              key={weekStart.toISOString()} 
              weekStart={weekStart} 
              month={month} 
              year={year} 
              schedules={schedules}
              onDayClick={handleCalendarDayClick}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScheduleCalendar;
