
import React from 'react';
import { cn } from '@/lib/utils';
import { Schedule } from '@/types/supabase/schedules';
import { DateBox } from './shift-card/DateBox';
import { TimeLocation } from './shift-card/TimeLocation';
import { ActionButtons } from './shift-card/ActionButtons';

interface ShiftCardProps {
  schedule: Schedule;
  onInfoClick: () => void;
  onEmailClick: () => void;
  onCancelClick: () => void;
}

const ShiftCard: React.FC<ShiftCardProps> = ({
  schedule,
  onInfoClick,
  onEmailClick,
  onCancelClick
}) => {
  const startTime = new Date(schedule.start_time);
  const endTime = new Date(schedule.end_time);
  
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all hover:shadow-sm",
      schedule.status === 'confirmed' ? "border-green-200 bg-green-50" :
      schedule.status === 'pending' ? "border-orange-200 bg-orange-50" :
      "border-gray-200 bg-white"
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DateBox startTime={startTime} status={schedule.status || 'pending'} />
          <TimeLocation
            startTime={startTime}
            endTime={endTime}
            location={schedule.location}
          />
        </div>
        
        <ActionButtons
          status={schedule.status || 'pending'}
          onInfoClick={onInfoClick}
          onEmailClick={onEmailClick}
          onCancelClick={onCancelClick}
        />
      </div>
    </div>
  );
};

export default ShiftCard;
