import React, { useState, useMemo } from 'react';
import { RefreshCw, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Schedule } from '@/hooks/use-schedules';
import MobileShiftCard from './MobileShiftCard';

interface MobileShiftListProps {
  schedules: Schedule[];
  isLoading: boolean;
  onRefresh: () => void;
  onScheduleClick?: (schedule: Schedule) => void;
}

const MobileShiftList: React.FC<MobileShiftListProps> = ({
  schedules,
  isLoading,
  onRefresh,
  onScheduleClick
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSchedules = useMemo(() => {
    let filtered = schedules;

    // Apply status filter
    if (filter !== 'all') {
      filtered = filtered.filter(schedule => {
        switch (filter) {
          case 'pending': return schedule.status === 'pending';
          case 'confirmed': return schedule.status === 'confirmed' || schedule.status === 'employee_accepted';
          case 'completed': return schedule.status === 'completed';
          default: return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(schedule => 
        schedule.title?.toLowerCase().includes(query) ||
        schedule.location?.toLowerCase().includes(query)
      );
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => 
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime()
    );
  }, [schedules, filter, searchQuery]);

  const filterCounts = useMemo(() => {
    const counts = {
      all: schedules.length,
      pending: schedules.filter(s => s.status === 'pending').length,
      confirmed: schedules.filter(s => s.status === 'confirmed' || s.status === 'employee_accepted').length,
      completed: schedules.filter(s => s.status === 'completed').length,
    };
    return counts;
  }, [schedules]);

  const filters = [
    { key: 'all', label: 'All', count: filterCounts.all },
    { key: 'pending', label: 'Pending', count: filterCounts.pending },
    { key: 'confirmed', label: 'Confirmed', count: filterCounts.confirmed },
    { key: 'completed', label: 'Completed', count: filterCounts.completed },
  ] as const;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">My Shifts</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="touch-target"
        >
          <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search shifts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 touch-target"
        />
      </div>

      {/* Filter Tabs */}
      <div className="flex overflow-x-auto gap-2 pb-1">
        {filters.map(({ key, label, count }) => (
          <Button
            key={key}
            variant={filter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(key)}
            className={cn(
              "flex-shrink-0 touch-target transition-all duration-200",
              filter === key 
                ? "bg-primary text-primary-foreground shadow-sm" 
                : "bg-background hover:bg-muted"
            )}
          >
            {label}
            {count > 0 && (
              <span className={cn(
                "ml-1.5 px-1.5 py-0.5 text-xs rounded-full font-medium",
                filter === key 
                  ? "bg-primary-foreground/20 text-primary-foreground" 
                  : "bg-muted text-muted-foreground"
              )}>
                {count}
              </span>
            )}
          </Button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <RefreshCw className="h-6 w-6 animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Loading shifts...</span>
          </div>
        </div>
      )}

      {/* Shifts List */}
      {!isLoading && (
        <div className="space-y-3">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule) => (
              <MobileShiftCard
                key={schedule.id}
                schedule={schedule}
                onClick={() => onScheduleClick?.(schedule)}
                onResponseComplete={onRefresh}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-2">
                {searchQuery ? 'No shifts found for your search' : `No ${filter} shifts`}
              </div>
              {searchQuery ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setSearchQuery('')}
                  className="text-primary"
                >
                  Clear search
                </Button>
              ) : filter !== 'all' ? (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setFilter('all')}
                  className="text-primary"
                >
                  View all shifts
                </Button>
              ) : (
                <p className="text-sm text-muted-foreground">Check back later for new shifts</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MobileShiftList;