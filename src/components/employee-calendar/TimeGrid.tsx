
import React from 'react';
import { CalendarProps } from './types';
import DayColumn from './DayColumn';

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
            />
          ))
        ) : (
          <DayColumn 
            day={currentDate}
            events={getEventsForDay(currentDate)} 
            timeSlots={timeSlots}
            formatEventTime={formatEventTime}
          />
        )}
      </div>
    </div>
  );
};

export default TimeGrid;
