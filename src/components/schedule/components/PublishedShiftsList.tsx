
import React from 'react';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';
import PublishedShiftCard from './PublishedShiftCard';

interface PublishedShiftsListProps {
  schedules: Schedule[];
  currentDate: Date;
  onShiftClick?: (shift: Schedule) => void;
}

const PublishedShiftsList: React.FC<PublishedShiftsListProps> = ({
  schedules,
  currentDate,
  onShiftClick
}) => {
  // Filter for published shifts in the current week
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  
  const publishedShifts = schedules.filter(schedule => {
    const shiftDate = new Date(schedule.start_time);
    return schedule.status !== 'pending' && 
           isWithinInterval(shiftDate, { start: weekStart, end: weekEnd });
  });

  // Sort shifts by start time
  const sortedShifts = publishedShifts.sort((a, b) => 
    new Date(a.start_time).getTime() - new Date(b.start_time).getTime()
  );

  if (sortedShifts.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="text-gray-400 text-lg mb-2">📅</div>
        <div className="text-gray-500">No published shifts for this week</div>
        <div className="text-sm text-gray-400 mt-1">
          Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-gray-500 mb-4">
        Week of {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
      </div>
      
      {sortedShifts.map((shift) => (
        <PublishedShiftCard
          key={shift.id}
          shift={{
            id: shift.id,
            title: shift.title,
            start_time: shift.start_time,
            end_time: shift.end_time,
            location: shift.location,
            department: shift.shift_type || 'General', // Using shift_type as department for now
            shift_type: shift.title?.split(' - ')[0] || 'Staff', // Extract role from title
            published: true,
            status: shift.status
          }}
          onClick={() => onShiftClick?.(shift)}
        />
      ))}
    </div>
  );
};

export default PublishedShiftsList;
