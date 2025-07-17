
import React, { useState } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSchedules, Schedule } from '@/hooks/use-schedules';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import ShiftCard from './components/ShiftCard';

interface ScheduleListProps {
  schedules: Schedule[];
  isLoading: boolean;
  onRefresh: () => void;
  showFilters?: boolean;
}

const ScheduleList: React.FC<ScheduleListProps> = ({
  schedules,
  isLoading,
  onRefresh,
  showFilters = false
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'rejected'>('all');
  const isMobile = useIsMobile();

  const filteredSchedules = schedules.filter(schedule => {
    if (filter === 'all') return true;
    if (filter === 'pending') return schedule.status === 'pending';
    if (filter === 'confirmed') return schedule.status === 'confirmed' || schedule.status === 'employee_accepted';
    if (filter === 'completed') return schedule.status === 'completed';
    if (filter === 'rejected') return schedule.status === 'rejected' || schedule.status === 'employee_rejected';
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header with refresh and filters */}
      <div className="flex items-center justify-between">
        <h2 className={cn("text-xl font-semibold", isMobile && "text-lg")}>My Shifts</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className={cn("flex items-center touch-target", isMobile && "px-3")}
          >
            <RefreshCw className={cn("h-4 w-4 mr-1", isLoading && "animate-spin")} />
            {!isMobile && "Refresh"}
          </Button>
          
          {showFilters && !isMobile && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center touch-target"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      {showFilters && (
        <div className={cn(
          "flex bg-muted p-1 rounded-lg",
          isMobile ? "overflow-x-auto gap-1" : "space-x-1"
        )}>
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'confirmed', label: 'Confirmed' },
            { key: 'completed', label: 'Completed' },
            { key: 'rejected', label: 'Rejected' }
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={cn(
                "px-3 py-2 rounded text-sm font-medium transition-all duration-200 touch-target flex-shrink-0",
                filter === key 
                  ? 'bg-background text-primary shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading shifts...</span>
          </div>
        </div>
      )}

      {/* Shifts list */}
      {!isLoading && (
        <div className={cn("space-y-3", isMobile && "space-y-2")}>
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule) => (
              <ShiftCard
                key={schedule.id}
                schedule={schedule}
                onResponseComplete={onRefresh}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">No shifts found</div>
              {filter !== 'all' ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Try changing the filter or check back later
                  </p>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setFilter('all')}
                    className="text-primary"
                  >
                    View all shifts
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Check back later for new shifts
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleList;
