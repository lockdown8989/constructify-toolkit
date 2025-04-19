
import React from 'react';
import { Schedule as SupabaseSchedule } from '@/types/supabase/schedules';
import { Schedule as AppSchedule } from '@/types/schedule.types';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Clock } from 'lucide-react';
import { ShiftCard } from '../../components/ShiftCard';

type Schedule = AppSchedule | SupabaseSchedule;

interface ScheduleContentProps {
  isLoading: boolean;
  schedules: Schedule[];
  filteredSchedules: Schedule[];
  onInfoClick: (scheduleId: string) => void;
  onEmailClick: (schedule: Schedule) => void;
  onCancelClick: (scheduleId: string) => void;
}

export const ScheduleContent: React.FC<ScheduleContentProps> = ({
  isLoading,
  filteredSchedules,
  onInfoClick,
  onEmailClick,
  onCancelClick
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Clock className="h-5 w-5 animate-spin text-blue-500 mr-2" />
        <span>Loading shifts...</span>
      </div>
    );
  }

  if (filteredSchedules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No shifts found for this period
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px]">
      <div className="p-4 space-y-4">
        {filteredSchedules.map((schedule) => (
          <ShiftCard
            key={schedule.id}
            schedule={schedule as SupabaseSchedule}
            onInfoClick={() => onInfoClick(schedule.id)}
            onEmailClick={() => onEmailClick(schedule)}
            onCancelClick={() => onCancelClick(schedule.id)}
          />
        ))}
      </div>
    </ScrollArea>
  );
};
