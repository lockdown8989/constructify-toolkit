
import React, { useState } from 'react';
import { Schedule } from '@/hooks/use-schedules';
import ShiftDetailCard from '../ShiftDetailCard';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import OpenShiftBlock from '@/components/restaurant/OpenShiftBlock';
import PublishedShiftCard from './PublishedShiftCard';
import { useOpenShifts } from '@/hooks/use-open-shifts';

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
  const { openShifts = [] } = useOpenShifts();
  
  const tabs = [
    { id: 'my-shifts', label: 'Shift Swaps' },
    { id: 'open-shifts', label: 'Open Shifts' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' }
  ];

  // Count pending shifts for the badge
  const pendingShiftsCount = schedules.filter(s => s.status === 'pending').length;
  const openShiftsCount = openShifts.filter(shift => shift.status === 'open').length;

  const filteredSchedules = schedules.filter(schedule => {
    switch (activeTab) {
      case 'my-shifts':
        return schedule.status === 'confirmed';
      case 'open-shifts':
        return schedule.shift_type === 'open_shift';
      case 'pending':
        return schedule.status === 'pending';
      case 'completed':
        return schedule.status === 'completed';
      default:
        return true;
    }
  });

  // Filter open shifts for the open-shifts tab
  const availableOpenShifts = openShifts.filter(shift => shift.status === 'open');

  console.log(`Filtered schedules for tab ${activeTab}:`, filteredSchedules.length);
  console.log(`Available open shifts:`, availableOpenShifts.length);

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
              {tab.id === 'open-shifts' && openShiftsCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs">
                  {openShiftsCount}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Shift Cards */}
      <Tabs value={activeTab} defaultValue={activeTab}>
        <TabsContent value={activeTab} className="flex-1 overflow-y-auto p-3 space-y-3">
          {activeTab === 'open-shifts' ? (
            // Show both published open shifts and available open shifts
            <>
              {availableOpenShifts.length > 0 ? (
                availableOpenShifts.map(shift => (
                  <PublishedShiftCard
                    key={shift.id}
                    shift={{
                      id: shift.id,
                      title: shift.title,
                      start_time: shift.start_time,
                      end_time: shift.end_time,
                      location: shift.location,
                      department: shift.department,
                      shift_type: shift.role,
                      published: true,
                      status: 'open'
                    }}
                    onClick={() => {
                      // Handle open shift click - could open assignment dialog
                      console.log('Open shift clicked:', shift.id);
                    }}
                  />
                ))
              ) : filteredSchedules.length > 0 ? (
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
                <div className="text-center py-8 text-gray-500 flex flex-col items-center">
                  <AlertCircle className="h-6 w-6 mb-2 text-gray-400" />
                  <p>No open shifts available</p>
                  <p className="text-sm mt-2">When managers create open shifts, they'll appear here for you to claim</p>
                </div>
              )}
            </>
          ) : filteredSchedules.length > 0 ? (
            activeTab === 'completed' ? (
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
                  status="completed"
                />
              ))
            ) : activeTab === 'pending' ? (
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
                  status="pending"
                />
              ))
            ) : (
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
