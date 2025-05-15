
import React from 'react';
import { useToast } from '@/hooks/use-toast';
import { CalendarEvent } from './types';

interface DayColumnProps {
  day: Date;
  events: CalendarEvent[];
  timeSlots: { hour: number; label: string }[];
  formatEventTime: (start: Date, end: Date) => string;
}

const DayColumn: React.FC<DayColumnProps> = ({ day, events, timeSlots, formatEventTime }) => {
  const { toast } = useToast();
  
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

export default DayColumn;
