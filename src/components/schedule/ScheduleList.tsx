
import React, { useState } from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSchedules, Schedule } from '@/hooks/use-schedules';
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
        <h2 className="text-xl font-semibold">My Shifts</h2>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex items-center"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          
          {showFilters && (
            <Button
              variant="outline"
              size="sm"
              className="flex items-center"
            >
              <Filter className="h-4 w-4 mr-1" />
              Filters
            </Button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      {showFilters && (
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
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
              className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                filter === key 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
          <span className="ml-2 text-gray-600">Loading shifts...</span>
        </div>
      )}

      {/* Shifts list */}
      {!isLoading && (
        <div className="space-y-3">
          {filteredSchedules.length > 0 ? (
            filteredSchedules.map((schedule) => (
              <ShiftCard
                key={schedule.id}
                schedule={schedule}
                onResponseComplete={onRefresh}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No shifts found</p>
              {filter !== 'all' && (
                <p className="text-sm mt-1">Try changing the filter or check back later</p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScheduleList;
