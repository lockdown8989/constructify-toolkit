
import React, { useState } from 'react';
import { Schedule } from '@/hooks/use-schedules';
import ShiftDetailCard from '../ShiftDetailCard';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import OpenShiftBlock from '@/components/restaurant/OpenShiftBlock';

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
    { id: 'my-shifts', label: 'Shift Swaps' },
    { id: 'open-shifts', label: 'Open Shifts' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' }
  ];

  // Count pending shifts for the badge
  const pendingShiftsCount = schedules.filter(s => s.status === 'pending').length;

  const filteredSchedules = schedules.filter(schedule => {
    switch (activeTab) {
      case 'my-shifts':
        return schedule.status === 'confirmed';
      case 'open-shifts':
        // Check if shift_type is 'open_shift' instead of comparing status
        return schedule.shift_type === 'open_shift';
      case 'pending':
        return schedule.status === 'pending';
      case 'completed':
        return schedule.status === 'completed';
      default:
        return true;
    }
  });

  // Log the filtered schedules
  console.log(`Filtered schedules for tab ${activeTab}:`, filteredSchedules.length);

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
                "flex-1 py-3 text-sm font-medium border-b-2 transition-colors relative",
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              )}
            >
              {tab.label}
              {tab.id === 'pending' && pendingShiftsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs">
                  {pendingShiftsCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Shift Cards */}
      <Tabs value={activeTab} defaultValue={activeTab}>
        <TabsContent value={activeTab} className="flex-1 overflow-y-auto p-3 space-y-3">
          {filteredSchedules.length > 0 ? (
            activeTab === 'open-shifts' ? (
              // Use OpenShiftBlock for open shifts
              filteredSchedules.map(schedule => (
                <OpenShiftBlock
                  key={schedule.id}
                  openShift={{
                    id: schedule.id,
                    title: schedule.title || '',
                    role: schedule.shift_type || '',
                    start_time: schedule.start_time,
                    end_time: schedule.end_time,
                    location: schedule.location || '',
                    notes: schedule.notes
                  }}
                  employeeId={schedule.employee_id}
                />
              ))
            ) : (
              // Use ShiftDetailCard for other types of shifts
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
            )
          ) : (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center">
              <AlertCircle className="h-6 w-6 mb-2 text-gray-400" />
              <p>No {activeTab.replace('-', ' ')} found</p>
              {activeTab === 'pending' && (
                <p className="text-sm mt-2">When managers assign you shifts that need confirmation, they'll appear here</p>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
