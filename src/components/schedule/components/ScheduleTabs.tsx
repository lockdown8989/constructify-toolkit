
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Bell, ChevronDown } from 'lucide-react';
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
  const getDisplayName = (tab: string) => {
    switch(tab) {
      case 'my-shifts': return 'My Shifts';
      case 'open-shifts': return 'Open Shifts';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      case 'completed': return 'Completed';
      default: return tab;
    }
  };
  
  // Count pending shifts for badge display
  const pendingShiftsCount = schedules.filter(schedule => schedule.status === 'pending').length;

  return (
    <div className="px-4 mt-4">
      <div className="mb-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-[200px] justify-between">
              {getDisplayName(activeTab)}
              {pendingShiftsCount > 0 && activeTab !== 'pending' && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {pendingShiftsCount}
                </span>
              )}
              <ChevronDown className="h-4 w-4 opacity-50 ml-auto" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]">
            <DropdownMenuRadioGroup value={activeTab} onValueChange={setActiveTab}>
              <DropdownMenuRadioItem value="my-shifts">My Shifts</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="open-shifts">Open Shifts</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="pending">
                Pending
                {pendingShiftsCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                    {pendingShiftsCount}
                  </span>
                )}
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="rejected">Rejected</DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="completed">Completed</DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="mt-4">
        {activeTab === 'my-shifts' && (
          schedules.filter(schedule => schedule.status === 'confirmed').length > 0 ? (
            schedules
              .filter(schedule => schedule.status === 'confirmed')
              .map(schedule => (
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
            <p className="text-center text-gray-500 py-4">No upcoming shifts</p>
          )
        )}
        
        {activeTab === 'open-shifts' && (
          <p className="text-center text-gray-500 py-4">No open shifts available</p>
        )}
        
        {activeTab === 'pending' && (
          schedules.filter(schedule => schedule.status === 'pending').length > 0 ? (
            schedules
              .filter(schedule => schedule.status === 'pending')
              .map(schedule => (
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
            <p className="text-center text-gray-500 py-4">No pending shifts</p>
          )
        )}
        
        {activeTab === 'rejected' && (
          schedules.filter(schedule => schedule.status === 'rejected').length > 0 ? (
            schedules
              .filter(schedule => schedule.status === 'rejected')
              .map(schedule => (
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
            <p className="text-center text-gray-500 py-4">No rejected shifts</p>
          )
        )}
        
        {activeTab === 'completed' && (
          schedules.filter(schedule => schedule.status === 'completed').length > 0 ? (
            schedules
              .filter(schedule => schedule.status === 'completed')
              .map(schedule => (
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
            <p className="text-center text-gray-500 py-4">No completed shifts</p>
          )
        )}
      </div>
    </div>
  );
};

