
import React from 'react';
import { Search, Calendar } from 'lucide-react';
import { ViewMode } from '@/types/restaurant-schedule';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

interface ScheduleHeaderProps {
  setViewMode: (value: ViewMode) => void;
}

const ScheduleHeader = ({ setViewMode }: ScheduleHeaderProps) => {
  return (
    <div className="mb-8">
      <div className="flex items-center mb-4">
        <Calendar className="h-8 w-8 text-primary mr-3" />
        <h1 className="text-3xl font-medium tracking-tight">Shift Calendar Schedule</h1>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs 
          defaultValue="week" 
          onValueChange={(value) => setViewMode(value as ViewMode)}
          className="bg-gray-100 rounded-full p-1"
        >
          <TabsList className="bg-transparent">
            <TabsTrigger 
              value="week" 
              className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Week
            </TabsTrigger>
            <TabsTrigger 
              value="month" 
              className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm"
            >
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search employees or roles..." 
            className="pl-9 rounded-full border-gray-200 w-full"
          />
        </div>
      </div>
    </div>
  );
};

export default ScheduleHeader;
