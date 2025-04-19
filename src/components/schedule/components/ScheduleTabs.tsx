
import React from 'react';
import { Schedule } from '@/hooks/use-schedules';
import ShiftDetailCard from '../ShiftDetailCard';
import { cn } from '@/lib/utils';

interface ScheduleTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  schedules: Schedule[];
  newSchedules: Record<string, boolean>;
  onInfoClick: (scheduleId: string) => void;
  onEmailClick: (schedule: Schedule) => void;
  onCancelClick: (scheduleId: string) => void;
  onResponseComplete?: () => void;
}

export const ScheduleTabs: React.FC<ScheduleTabsProps> = ({
  activeTab,
  setActiveTab,
  schedules,
  onInfoClick,
  onEmailClick,
  onCancelClick,
  onResponseComplete,
}) => {
  const tabs = [
    { id: 'my-shifts', label: 'My Shifts', status: 'confirmed' },
    { id: 'pending', label: 'Pending', status: 'pending' },
    { id: 'completed', label: 'Completed', status: 'completed' }
  ];
  
  const pendingShiftsCount = schedules.filter(schedule => schedule.status === 'pending').length;

  // Filter out any duplicate schedules based on their ID
  const uniqueSchedules = Array.from(new Map(schedules.map(schedule => [schedule.id, schedule])).values());
  
  const filteredSchedules = uniqueSchedules.filter(schedule => {
    switch (activeTab) {
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

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="px-4 py-2 flex justify-between items-center border-b bg-white sticky top-0 z-10">
        <div className="flex space-x-4 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
              {tab.id === 'pending' && pendingShiftsCount > 0 && (
                <span className="ml-1.5 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                  {pendingShiftsCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {filteredSchedules.length > 0 ? (
          filteredSchedules.map(schedule => (
            <ShiftDetailCard
              key={schedule.id}
              schedule={schedule}
              onInfoClick={() => onInfoClick(schedule.id)}
              onEmailClick={() => onEmailClick(schedule)}
              onCancelClick={() => onCancelClick(schedule.id)}
              onResponseComplete={onResponseComplete}
            />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            No {activeTab.replace('-', ' ')} found
          </div>
        )}
      </div>
    </div>
  );
};
