
import React from 'react';
import { Schedule } from '@/hooks/use-schedules';
import ShiftDetailCard from '../ShiftDetailCard';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

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
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        {tabs.map(tab => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className={cn(
              "relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4",
              "data-[state=active]:border-b-primary data-[state=active]:text-primary"
            )}
          >
            {tab.label}
            {tab.id === 'pending' && schedules.filter(s => s.status === 'pending').length > 0 && (
              <span className="ml-2 rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                {schedules.filter(s => s.status === 'pending').length}
              </span>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map(tab => (
        <TabsContent key={tab.id} value={tab.id} className="p-4">
          <ScrollArea className="h-[400px]">
            <div className="space-y-4">
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
                  No {tab.label.toLowerCase()} found
                </div>
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      ))}
    </Tabs>
  );
};
