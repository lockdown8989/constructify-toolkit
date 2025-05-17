
import React from 'react';
import { Schedule } from '@/hooks/use-schedules';
import { format } from 'date-fns';

interface EventRendererProps {
  schedule: Schedule;
  getEventPosition: (schedule: Schedule) => { top: number; height: number };
  getEventColor: (index: number) => string;
  index: number;
}

export const EventRenderer: React.FC<EventRendererProps> = ({ 
  schedule, 
  getEventPosition, 
  getEventColor, 
  index 
}) => {
  const { top, height } = getEventPosition(schedule);
  const colorClass = getEventColor(index);
  
  return (
    <div
      key={schedule.id}
      className={`absolute w-full rounded-md border-l-4 px-2 py-1 text-xs ${colorClass}`}
      style={{ top: `${top}px`, height: `${height}px` }}
    >
      <p className="font-medium">{schedule.title}</p>
      <p className="text-xs opacity-80">
        {format(new Date(schedule.start_time), 'h:mm a')} - {format(new Date(schedule.end_time), 'h:mm a')}
      </p>
    </div>
  );
};

export default EventRenderer;
