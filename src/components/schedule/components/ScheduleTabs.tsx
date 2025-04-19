
import React from 'react';
import { format, parseISO } from 'date-fns';
import { ChevronDown } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import ShiftDetailCard from '../ShiftDetailCard';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
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
    { id: 'my-shifts', label: 'My Shifts', status: 'confirmed' },
    { id: 'open-shifts', label: 'Open Shifts', status: null },
    { id: 'pending', label: 'Pending', status: 'pending' },
    { id: 'completed', label: 'Completed', status: 'completed' }
  ];
  
  const getDisplayName = (tab: string) => {
    return tabs.find(t => t.id === tab)?.label || tab;
  };
  
  const pendingShiftsCount = schedules.filter(schedule => schedule.status === 'pending').length;
  
  const filteredSchedules = schedules.filter(schedule => {
    switch (activeTab) {
      case 'my-shifts':
        return schedule.status === 'confirmed';
      case 'open-shifts':
        return false; // No open shifts implementation yet
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
      <div className="px-4 py-2 flex justify-between items-center border-b bg-white sticky top-0 z-10">
        <div className="flex space-x-4 overflow-x-auto hide-scrollbar">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "whitespace-nowrap px-1 py-2 border-b-2 text-sm font-medium",
                activeTab === tab.id
                  ? "border-cyan-500 text-cyan-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              )}
            >
              {tab.label}
              {tab.id === 'pending' && pendingShiftsCount > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-red-100 text-red-600 rounded-full">
                  {pendingShiftsCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
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
