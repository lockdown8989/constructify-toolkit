
import React from 'react';
import { Schedule } from '@/hooks/use-schedules';
import ShiftDetailCard from '../ShiftDetailCard';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

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
  const [currentDate, setCurrentDate] = React.useState(new Date());
  
  const tabs = [
    { id: 'my-shifts', label: 'My Shifts' },
    { id: 'open-shifts', label: 'Open Shifts' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' }
  ];

  const daysOfWeek = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

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
      {/* Calendar Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
            <ChevronLeft className="h-6 w-6" />
          </button>
          <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
          <button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
        
        {/* Calendar Days Header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {daysOfWeek.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-600">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: 35 }, (_, i) => (
            <div
              key={i}
              className={cn(
                "aspect-square flex items-center justify-center text-lg border rounded-lg",
                i === 29 && "text-blue-500 font-bold",
                i === 30 && "text-green-500 font-bold"
              )}
            >
              {i < 3 ? i + 29 : i - 2}
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
