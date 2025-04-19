
import React from 'react';
import { Button } from '@/components/ui/button';
import { ViewMode } from '@/types/restaurant-schedule';
import { Calendar, Users, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScheduleHeaderProps {
  setViewMode: (mode: ViewMode) => void;
  onSyncCalendar: () => void;
  onSyncEmployeeData: () => void;
  isSyncing: boolean;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  setViewMode,
  onSyncCalendar,
  onSyncEmployeeData,
  isSyncing
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
      <div className="flex items-center">
        <Calendar className="h-8 w-8 mr-2 text-blue-600" strokeWidth={1.5} />
        <h1 className="text-2xl sm:text-3xl font-bold">Shift Calendar</h1>
      </div>
      
      <div className="flex items-center gap-3">
        <div className="flex bg-gray-100 rounded-full p-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('week')}
            className={cn(
              "rounded-full text-sm",
              "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            )}
            data-state="active"
          >
            Week
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setViewMode('month')}
            className={cn(
              "rounded-full text-sm",
              "data-[state=active]:bg-white data-[state=active]:text-black data-[state=active]:shadow-sm"
            )}
          >
            Month
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSyncEmployeeData}
          disabled={isSyncing}
          className="text-xs sm:text-sm"
        >
          {isSyncing ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Users className="h-3 w-3 mr-1" />
              Sync Data
            </>
          )}
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSyncCalendar}
          disabled={isSyncing}
          className="text-xs sm:text-sm"
        >
          {isSyncing ? (
            <>
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Syncing...
            </>
          ) : (
            <>
              <Calendar className="h-3 w-3 mr-1" />
              Sync Calendar
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default ScheduleHeader;
