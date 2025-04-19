
import React from 'react';
import { format } from 'date-fns';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Schedule as SupabaseSchedule } from '@/types/supabase/schedules';
import { Schedule as AppSchedule } from '@/types/schedule.types';
import { CalendarHeader } from './components/CalendarHeader';
import { TabNavigation } from './components/TabNavigation';
import { ScheduleContent } from './components/ScheduleContent';

type Schedule = AppSchedule | SupabaseSchedule;

interface ScheduleCalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  schedules: Schedule[];
  onShiftAction: (scheduleId: string, action: 'confirm' | 'cancel') => void;
  isLoading?: boolean;
}

export const ScheduleCalendarView: React.FC<ScheduleCalendarViewProps> = ({
  currentDate,
  schedules,
  onShiftAction,
  isLoading = false
}) => {
  const handleInfoClick = (scheduleId: string) => {
    // Info click handler implementation
    console.log('Info clicked for schedule:', scheduleId);
  };

  const handleEmailClick = (schedule: Schedule) => {
    // Email click handler implementation
    console.log('Email clicked for schedule:', schedule.id);
  };

  const handleCancelClick = (scheduleId: string) => {
    onShiftAction(scheduleId, 'cancel');
  };

  const getFilteredSchedules = (tab: string) => {
    return schedules.filter(schedule => {
      switch (tab) {
        case 'my-shifts':
          return schedule.status === 'confirmed';
        case 'pending':
          return schedule.status === 'pending';
        case 'completed':
          return schedule.status === 'completed';
        default:
          return true;
      }
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <CalendarHeader currentDateLabel={format(currentDate, 'MMMM yyyy')} />

      <Tabs defaultValue="my-shifts" className="w-full">
        <TabNavigation schedules={schedules} />

        {['my-shifts', 'open-shifts', 'pending', 'completed'].map((tab) => (
          <TabsContent key={tab} value={tab} className="p-4">
            <ScheduleContent
              isLoading={isLoading}
              schedules={schedules}
              filteredSchedules={getFilteredSchedules(tab)}
              onInfoClick={handleInfoClick}
              onEmailClick={handleEmailClick}
              onCancelClick={handleCancelClick}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};
