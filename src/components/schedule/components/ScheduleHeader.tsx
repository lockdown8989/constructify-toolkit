
import React from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface ScheduleHeaderProps {
  pendingCount: {
    shifts: number;
    availability: number;
  };
  lastRefreshed: Date;
  isManager: boolean;
  onRefresh: () => void;
}

const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  pendingCount,
  lastRefreshed,
  isManager,
  onRefresh,
}) => {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold">Schedule Requests</CardTitle>
          <CardDescription className="text-sm text-muted-foreground mt-1">
            Manage shift swaps and availability requests
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          {isManager && (pendingCount.shifts > 0 || pendingCount.availability > 0) && (
            <Badge className="bg-amber-100 text-amber-800 border border-amber-300 flex items-center">
              <AlertCircle className="h-3.5 w-3.5 mr-1" />
              {pendingCount.shifts + pendingCount.availability} pending
            </Badge>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            className="flex items-center"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="text-xs text-muted-foreground mt-2">
        Last updated: {lastRefreshed.toLocaleTimeString()}
      </div>
    </div>
  );
};

export default ScheduleHeader;
