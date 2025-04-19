
import React from 'react';
import { TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Schedule } from '@/types/supabase/schedules';

interface TabNavigationProps {
  schedules: Schedule[];
}

export const TabNavigation: React.FC<TabNavigationProps> = ({ schedules }) => {
  return (
    <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
      <TabsTrigger
        value="my-shifts"
        className={cn(
          "relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4",
          "data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-500"
        )}
      >
        My Shifts
      </TabsTrigger>
      <TabsTrigger
        value="open-shifts"
        className={cn(
          "relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4",
          "data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-500"
        )}
      >
        Open Shifts
      </TabsTrigger>
      <TabsTrigger
        value="pending"
        className={cn(
          "relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4",
          "data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-500"
        )}
      >
        Pending
        {schedules.filter(s => s.status === 'pending').length > 0 && (
          <Badge variant="default" className="ml-2 bg-orange-100 text-orange-700">
            {schedules.filter(s => s.status === 'pending').length}
          </Badge>
        )}
      </TabsTrigger>
      <TabsTrigger
        value="completed"
        className={cn(
          "relative h-11 rounded-none border-b-2 border-b-transparent bg-transparent px-4",
          "data-[state=active]:border-b-blue-500 data-[state=active]:text-blue-500"
        )}
      >
        Completed
      </TabsTrigger>
    </TabsList>
  );
};
