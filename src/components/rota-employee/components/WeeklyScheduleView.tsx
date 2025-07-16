
import React from 'react';
import ModernRotaCalendar from './ModernRotaCalendar';

interface WeeklyScheduleViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  currentDate,
  onDateChange
}) => {
  return (
    <ModernRotaCalendar 
      currentDate={currentDate}
      onDateChange={onDateChange}
    />
  );
};

export default WeeklyScheduleView;
