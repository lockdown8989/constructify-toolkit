
import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface ScheduleHeaderProps {
  onRefresh: () => void;
  pendingCount?: {
    shifts: number;
    availability: number;
  };
  lastRefreshed?: Date;
  isManager?: boolean;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({ 
  onRefresh,
  pendingCount,
  lastRefreshed,
  isManager
}) => {
  return (
    <div className="flex justify-between items-center px-4 pt-2 pb-4">
      <div>
        <h2 className="text-xl font-semibold">Your Schedule</h2>
        {lastRefreshed && (
          <p className="text-xs text-muted-foreground mt-1">
            Last updated: {format(lastRefreshed, 'MMM d, h:mm a')}
          </p>
        )}
        {pendingCount && (pendingCount.shifts > 0 || pendingCount.availability > 0) && (
          <p className="text-xs text-amber-600 font-medium mt-1">
            {pendingCount.shifts + pendingCount.availability} pending request{(pendingCount.shifts + pendingCount.availability) !== 1 ? 's' : ''}
          </p>
        )}
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onRefresh}
        className="flex items-center gap-1"
      >
        <RefreshCw className="h-3.5 w-3.5" />
        <span>Refresh</span>
      </Button>
    </div>
  );
};

export default ScheduleHeader;
