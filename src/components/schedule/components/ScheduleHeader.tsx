import React from 'react';
import { RefreshCw, AlertCircle, Calendar } from 'lucide-react';
import { CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatTime } from '@/utils/format';
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
  onRefresh
}) => {
  const totalPending = pendingCount.shifts + pendingCount.availability;
  return <div className="bg-white border-b p-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Calendar className="h-5 w-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-zinc-950">Schedule Requests</CardTitle>
            <CardDescription className="text-sm text-muted-foreground mt-1">
              Manage shift swaps and availability requests
            </CardDescription>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isManager && totalPending > 0 && <Badge className="bg-amber-50 text-amber-800 border border-amber-300 flex items-center gap-1 px-2.5 py-1.5">
              <AlertCircle className="h-3.5 w-3.5" />
              <span className="font-medium">{totalPending} pending</span>
            </Badge>}
          <Button variant="outline" size="sm" onClick={onRefresh} className="flex items-center gap-1.5 h-9">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="text-xs text-gray-500 flex items-center gap-1.5">
        <span>Last updated:</span>
        <span className="font-medium text-gray-700">{formatTime(lastRefreshed.toISOString())}</span>
      </div>
    </div>;
};
export default ScheduleHeader;