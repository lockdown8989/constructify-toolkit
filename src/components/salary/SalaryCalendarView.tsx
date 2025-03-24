
import React from 'react';
import { format, startOfMonth, endOfMonth, addDays, isSameMonth, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import type { Employee } from '@/hooks/use-employees';

type EventType = 'vacation' | 'work' | 'sickness' | 'birthday';

interface CalendarEvent {
  id: string;
  type: EventType;
  title: string;
  startDate: Date;
  endDate: Date;
  employeeId: string;
}

interface SalaryCalendarViewProps {
  month: Date;
  employees: Employee[];
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SalaryCalendarView: React.FC<SalaryCalendarViewProps> = ({
  month,
  employees
}) => {
  // Generate mock events for display purposes
  const mockEvents: CalendarEvent[] = React.useMemo(() => {
    if (!employees.length) return [];
    
    const events: CalendarEvent[] = [];
    const monthStart = startOfMonth(month);
    
    // Add vacation events
    events.push({
      id: '1',
      type: 'vacation',
      title: 'Vacation',
      startDate: new Date(month.getFullYear(), month.getMonth(), 1),
      endDate: new Date(month.getFullYear(), month.getMonth(), 3),
      employeeId: employees[0]?.id || ''
    });
    
    // Add work day events
    events.push({
      id: '2',
      type: 'work',
      title: 'Work day',
      startDate: new Date(month.getFullYear(), month.getMonth(), 13),
      endDate: new Date(month.getFullYear(), month.getMonth(), 19),
      employeeId: employees[0]?.id || ''
    });
    
    // Add sickness events
    events.push({
      id: '3',
      type: 'sickness',
      title: 'Sickness',
      startDate: new Date(month.getFullYear(), month.getMonth(), 22),
      endDate: new Date(month.getFullYear(), month.getMonth(), 24),
      employeeId: employees[0]?.id || ''
    });
    
    // Add birthday events
    events.push({
      id: '4',
      type: 'birthday',
      title: 'Birthday',
      startDate: new Date(month.getFullYear(), month.getMonth(), 11),
      endDate: new Date(month.getFullYear(), month.getMonth(), 11),
      employeeId: 'Max'
    });
    
    return events;
  }, [month, employees]);
  
  // Generate calendar days
  const calendarDays = React.useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = new Date(monthStart);
    const days = [];
    
    // Set to Monday of the week
    startDate.setDate(startDate.getDate() - (startDate.getDay() === 0 ? 6 : startDate.getDay() - 1));
    
    // Create 42 days (6 weeks)
    for (let i = 0; i < 42; i++) {
      const day = addDays(startDate, i);
      
      // Only show 5 weeks if the 6th week is entirely in the next month
      if (i >= 35 && !isSameMonth(day, monthEnd)) {
        break;
      }
      
      days.push(day);
    }
    
    return days;
  }, [month]);
  
  // Find events for a specific day
  const getEventsForDay = (day: Date): CalendarEvent[] => {
    return mockEvents.filter(event => {
      const eventStartDay = new Date(event.startDate);
      const eventEndDay = new Date(event.endDate);
      
      // Check if the day falls within the event range
      return day >= eventStartDay && day <= eventEndDay;
    });
  };
  
  return (
    <div className="w-full">
      {/* Calendar header */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {DAYS_OF_WEEK.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, i) => {
          const dayEvents = getEventsForDay(day);
          const isCurrentMonth = isSameMonth(day, month);
          
          return (
            <div 
              key={i}
              className={cn(
                "min-h-[80px] p-2 rounded-md border",
                isCurrentMonth ? "bg-white" : "bg-gray-50",
                isToday(day) && "border-blue-400",
                !isCurrentMonth && "opacity-50",
                dayEvents.some(e => e.type === 'vacation') && "bg-gray-100",
                [0, 1].includes(day.getDay()) && "bg-gray-50/50" // Weekend styling
              )}
            >
              <div className="flex justify-between items-start">
                <span className={cn(
                  "inline-block w-7 h-7 rounded-full text-center leading-7 text-sm",
                  isToday(day) && "bg-blue-500 text-white"
                )}>
                  {day.getDate()}
                </span>
              </div>
              
              {/* Events */}
              <div className="mt-1 space-y-1">
                {dayEvents.map(event => (
                  <div 
                    key={event.id}
                    className={cn(
                      "text-xs p-1 rounded flex items-center",
                      event.type === 'vacation' && "bg-gray-200",
                      event.type === 'work' && "bg-amber-100",
                      event.type === 'sickness' && "bg-red-100",
                      event.type === 'birthday' && "bg-amber-200"
                    )}
                  >
                    <span className="w-1.5 h-1.5 rounded-full mr-1 flex-shrink-0 bg-current" />
                    <span className="truncate">{event.title}</span>
                    
                    {day.getDate() === event.startDate.getDate() && (
                      <span className="ml-auto text-xxs whitespace-nowrap">
                        {event.startDate.getDate()} Dec - {event.endDate.getDate()} Dec
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SalaryCalendarView;
