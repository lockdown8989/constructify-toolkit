
import React from 'react';
import { Schedule } from '@/types/supabase/schedules';
import { DateBox } from './shift-card/DateBox';
import { TimeLocation } from './shift-card/TimeLocation';
import { ActionButtons } from './shift-card/ActionButtons';
import { useStatusStyles } from '@/hooks/use-status-styles';

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
  const { getCardStyles } = useStatusStyles();
  const startTime = new Date(schedule.start_time);
  const endTime = new Date(schedule.end_time);
  
  return (
    <div className={getCardStyles(schedule.status)}>
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
