
import React from 'react';
import { isSameDay } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { CalendarProps } from './types';

interface TimeGridProps extends CalendarProps {
  timeSlots: { hour: number; label: string }[];
  weekDays: Date[];
}

const TimeGrid: React.FC<TimeGridProps> = ({ 
  events, 
  currentDate, 
  viewMode, 
  getEventsForDay,
  formatEventTime,
  timeSlots,
  weekDays
}) => {
  const { toast } = useToast();
  
  return (
    <div className="relative">
      <div className={`grid ${viewMode === 'week' ? 'grid-cols-8' : 'grid-cols-2'}`}>
        {/* Time Labels */}
        <div className="sticky left-0 bg-white z-10">
          {timeSlots.map((slot) => (
            <div key={slot.hour} className="h-16 border-t border-r flex items-start justify-center text-xs text-gray-500 w-16">
              {slot.hour > 0 && <span className="mt-1">{slot.label}</span>}
            </div>
          ))}
        </div>
        
        {/* Day Columns */}
        {viewMode === 'week' ? (
          weekDays.map((day, dayIndex) => (
            <DayColumn 
              key={dayIndex}
              day={day}
              events={getEventsForDay(day)} 
              timeSlots={timeSlots}
              formatEventTime={formatEventTime}
              toast={toast}
            />
          ))
        ) : (
          <DayColumn 
            day={currentDate}
            events={getEventsForDay(currentDate)} 
            timeSlots={timeSlots}
            formatEventTime={formatEventTime}
            toast={toast}
          />
        )}
      </div>
    </div>
  );
};

interface DayColumnProps {
  day: Date;
  events: Array<{
    id: string;
    title: string;
    start: Date;
    end: Date;
    color: string;
  }>;
  timeSlots: { hour: number; label: string }[];
  formatEventTime: (start: Date, end: Date) => string;
  toast: any;
}

const DayColumn: React.FC<DayColumnProps> = ({ day, events, timeSlots, formatEventTime, toast }) => {
  return (
    <div className="relative">
      {timeSlots.map((slot) => (
        <div key={slot.hour} className="h-16 border-t border-l first:border-l-0">
          &nbsp;
        </div>
      ))}
      
      {/* Events for this day */}
      {events.map((event) => {
        // Calculate position based on event time
        const startHour = event.start.getHours() + (event.start.getMinutes() / 60);
        const endHour = event.end.getHours() + (event.end.getMinutes() / 60);
        const duration = endHour - startHour;
        
        return (
          <div
            key={event.id}
            className="absolute left-1 right-1 rounded overflow-hidden shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
            style={{
              top: `${startHour * 4}rem`,
              height: `${duration * 4}rem`,
              backgroundColor: event.color,
              borderLeft: `3px solid ${event.color}`,
            }}
            onClick={() => toast({ title: event.title, description: formatEventTime(event.start, event.end) })}
          >
            <div className="p-1 text-white">
              <div className="text-xs">{formatEventTime(event.start, event.end)}</div>
              <div className="font-medium text-sm">{event.title}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TimeGrid;
