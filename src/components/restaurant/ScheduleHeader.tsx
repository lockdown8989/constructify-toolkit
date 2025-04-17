
import React from 'react';
import { Search, Calendar, RefreshCw, Users } from 'lucide-react';
import { ViewMode } from '@/types/restaurant-schedule';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface ScheduleHeaderProps {
  setViewMode: (value: ViewMode) => void;
  onSyncCalendar?: () => void;
  onSyncEmployeeData?: () => void;
  isSyncing?: boolean;
}

const ScheduleHeader = ({ 
  setViewMode, 
  onSyncCalendar, 
  onSyncEmployeeData,
  isSyncing = false 
}: ScheduleHeaderProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="mb-4 sm:mb-6">
      <div className="flex flex-wrap items-center mb-4 sm:mb-5 gap-2">
        <Calendar className="h-7 w-7 sm:h-8 sm:w-8 text-primary mr-2 sm:mr-3" />
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-gray-900">Shift Calendar</h1>
        
        <div className="ml-auto flex items-center gap-2">
          {onSyncEmployeeData && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSyncEmployeeData}
              disabled={isSyncing}
              className="rounded-full border-gray-200 hover:bg-gray-50"
            >
              <Users className={cn("h-3.5 w-3.5 mr-1.5", isSyncing && "animate-pulse")} />
              <span className={cn("", isMobile ? "sr-only" : "")}>
                {isSyncing ? "Syncing..." : "Sync Staff"}
              </span>
            </Button>
          )}
          
          {onSyncCalendar && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onSyncCalendar}
              className="rounded-full border-gray-200 hover:bg-gray-50"
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
              <span className={cn("", isMobile ? "sr-only" : "")}>Sync Calendar</span>
            </Button>
          )}
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <Tabs 
          defaultValue="week" 
          onValueChange={(value) => setViewMode(value as ViewMode)}
          className="bg-gray-100 rounded-full p-1"
        >
          <TabsList className="bg-transparent">
            <TabsTrigger 
              value="week" 
              className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm"
            >
              Week
            </TabsTrigger>
            <TabsTrigger 
              value="month" 
              className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow-sm text-sm"
            >
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search employees or roles..." 
            className="pl-9 rounded-full border-gray-200 w-full focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>
      </div>
    </div>
  );
};

export default ScheduleHeader;
