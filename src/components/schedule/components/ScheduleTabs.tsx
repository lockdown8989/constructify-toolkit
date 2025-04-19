
import React from 'react';
import { Schedule } from '@/hooks/use-schedules';
import ShiftDetailCard from '../ShiftDetailCard';
import { cn } from '@/lib/utils';

interface ScheduleTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  schedules: Schedule[];
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
    { id: 'my-shifts', label: 'My Shifts' },
    { id: 'open-shifts', label: 'Open Shifts' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' }
  ];

  // Calendar days
  const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const dates = [2, 3, 4, 5, 6, 7, 8];

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
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-7 gap-4 mb-2">
          {days.map((day, index) => (
            <div key={day} className="text-center">
              <div className="text-sm font-medium text-gray-600">{day}</div>
              <div className={cn(
                "text-xl font-bold mt-1",
                index === 5 && "text-amber-500",
                index === 6 && "text-green-500"
              )}>
                {dates[index]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b">
        <div className="flex">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex-1 py-3 text-sm font-medium relative",
                activeTab === tab.id
                  ? "text-blue-600"
                  : "text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Shift Cards */}
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
