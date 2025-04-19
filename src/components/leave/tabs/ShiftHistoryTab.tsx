
import React from 'react';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import ShiftDetailCard from '@/components/schedule/ShiftDetailCard';

const ShiftHistoryTab = () => {
  const { schedules } = useEmployeeSchedule();
  
  // Filter schedules for responded ones (accepted or rejected)
  const respondedSchedules = schedules?.filter(s => 
    s.status === 'confirmed' || s.status === 'rejected'
  ) || [];

  if (respondedSchedules.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No shift history available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {respondedSchedules.map(schedule => (
        <div key={schedule.id} className="opacity-70">
          <ShiftDetailCard
            schedule={schedule}
            onInfoClick={() => {}}
            onEmailClick={() => {}}
            onCancelClick={() => {}}
          />
        </div>
      ))}
    </div>
  );
};

export default ShiftHistoryTab;
