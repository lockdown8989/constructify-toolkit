
import React from 'react';
import { Schedule } from '@/hooks/use-schedules';
import TimeSlots from '../components/TimeSlots';
import TimeIndicator from '../components/TimeIndicator';
import EventRenderer from '../components/events/EventRenderer';

interface DayViewProps {
  currentDate: Date;
  schedules: Schedule[];
  currentTimeTop: number;
  getEventPosition: (schedule: Schedule) => { top: number; height: number };
  getEventColor: (index: number) => string;
}

const DayViewComponent: React.FC<DayViewProps> = ({
  currentDate,
  schedules,
  currentTimeTop,
  getEventPosition,
  getEventColor
}) => {
  // Filter schedules for the current day
  const filteredSchedules = schedules.filter(schedule => {
    const scheduleDate = new Date(schedule.start_time);
    return (
      scheduleDate.getDate() === currentDate.getDate() &&
      scheduleDate.getMonth() === currentDate.getMonth() &&
      scheduleDate.getFullYear() === currentDate.getFullYear()
    );
  });

  return (
    <div className="border rounded-md overflow-hidden bg-white">
      <div className="relative">
        <TimeSlots />
        
        {/* Current time indicator */}
        {currentTimeTop > 0 && (
          <TimeIndicator />
        )}
        
        {/* Render events */}
        <div className="absolute top-0 left-16 right-0 h-full">
          {filteredSchedules.map((schedule, index) => (
            <EventRenderer 
              key={schedule.id}
              schedule={schedule}
              getEventPosition={getEventPosition}
              getEventColor={getEventColor}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DayViewComponent;
