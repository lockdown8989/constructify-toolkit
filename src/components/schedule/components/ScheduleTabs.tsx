
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
  newSchedules,
  onInfoClick,
  onEmailClick,
  onCancelClick,
  onResponseComplete,
}) => {
  const tabs = [
    { id: 'my-shifts', label: 'My Shifts' },
    { id: 'open-shifts', label: 'Open Shifts' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' }
  ];

  const filteredSchedules = schedules.filter(schedule => {
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
    <div className="flex flex-col h-full bg-white">
      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-2 text-sm font-medium border-b-2 transition-colors",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Shift Cards */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
