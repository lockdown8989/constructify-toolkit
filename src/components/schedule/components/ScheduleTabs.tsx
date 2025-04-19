
import React from 'react';
import { format, parseISO } from 'date-fns';
import { Bell } from 'lucide-react';
import { Schedule } from '@/hooks/use-schedules';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import ShiftDetailCard from '../ShiftDetailCard';

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
  return (
    <div className="px-4 mt-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full grid grid-cols-5">
          <TabsTrigger value="my-shifts">My Shifts</TabsTrigger>
          <TabsTrigger value="open-shifts">Open Shifts</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="rejected">Rejected</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        
        <TabsContent value="my-shifts" className="mt-4">
          {schedules.length > 0 ? (
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
          )}
        </TabsContent>
        
        <TabsContent value="open-shifts" className="mt-4">
          <p className="text-center text-gray-500 py-4">No open shifts available</p>
        </TabsContent>
        
        <TabsContent value="pending" className="mt-4">
          {schedules
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
            ))}
          {schedules.filter(schedule => schedule.status === 'pending').length === 0 && (
            <p className="text-center text-gray-500 py-4">No pending shifts</p>
          )}
        </TabsContent>
        
        <TabsContent value="rejected" className="mt-4">
          {schedules
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
            ))}
          {schedules.filter(schedule => schedule.status === 'rejected').length === 0 && (
            <p className="text-center text-gray-500 py-4">No rejected shifts</p>
          )}
        </TabsContent>
        
        <TabsContent value="completed" className="mt-4">
          {schedules
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
            ))}
          {schedules.filter(schedule => schedule.status === 'completed').length === 0 && (
            <p className="text-center text-gray-500 py-4">No completed shifts</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};
