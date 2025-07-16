
import React, { useState } from 'react';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { Schedule } from '@/hooks/use-schedules';
import { Button } from '@/components/ui/button';
import { PlusCircle, Clock, Filter, X, RefreshCw, Check, X as XIcon } from 'lucide-react';
import { useShiftResponse } from '@/hooks/use-shift-response';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';

interface ScheduleListProps {
  schedules: Schedule[];
  isLoading: boolean;
  onRefresh: () => void;
  showFilters: boolean;
  onAddSchedule?: () => void;
  employeeNames?: Record<string, string>;
  className?: string;
}

const ScheduleList = ({ 
  schedules, 
  isLoading,
  onRefresh,
  showFilters,
  onAddSchedule, 
  employeeNames = {},
  className 
}: ScheduleListProps) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>('all');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const { respondToShift } = useShiftResponse();
  
  // Create a list of unique employee IDs from the schedules
  const uniqueEmployees = Array.from(
    new Set(schedules.map(schedule => schedule.employee_id))
  );
  
  const filteredSchedules = schedules.filter(schedule => {
    // Filter by employee
    const matchesEmployee = selectedEmployee === 'all' || schedule.employee_id === selectedEmployee;
    
    // Filter by date range
    let matchesDateRange = true;
    if (dateRange?.from) {
      const scheduleDate = parseISO(schedule.start_time);
      if (dateRange.to) {
        // If we have a date range, check if the schedule falls within it
        matchesDateRange = isWithinInterval(scheduleDate, {
          start: dateRange.from,
          end: dateRange.to
        });
      } else {
        // If we only have a start date, check if the schedule is on or after it
        matchesDateRange = scheduleDate >= dateRange.from;
      }
    }
    
    return matchesEmployee && matchesDateRange;
  });
  
  const sortedSchedules = [...filteredSchedules].sort((a, b) => {
    return new Date(a.start_time).getTime() - new Date(b.start_time).getTime();
  });
  
  const resetFilters = () => {
    setSelectedEmployee('all');
    setDateRange(undefined);
  };
  
  const hasActiveFilters = selectedEmployee !== 'all' || dateRange !== undefined;

  const handleShiftResponse = async (scheduleId: string, response: 'accepted' | 'rejected') => {
    try {
      await respondToShift.mutateAsync({ scheduleId, response });
      toast({
        title: response === 'accepted' ? "Shift Confirmed" : "Shift Rejected",
        description: `Your shift has been ${response === 'accepted' ? 'confirmed' : 'rejected'} successfully.`,
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${response === 'accepted' ? 'confirm' : 'reject'} shift. Please try again.`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className={cn("bg-white rounded-3xl p-6 card-shadow", className)}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-medium">My Shifts</h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh}
            disabled={isLoading}
            className="gap-1"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          
          {showFilters && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowFiltersPanel(!showFiltersPanel)}
              className={cn(
                "gap-1",
                showFiltersPanel && "bg-blue-50 border-blue-200"
              )}
            >
              <Filter className="h-4 w-4" />
              Filters
              {hasActiveFilters && (
                <span className="bg-blue-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-xs">
                  !
                </span>
              )}
            </Button>
          )}
          
          {onAddSchedule && (
            <Button variant="outline" size="sm" onClick={onAddSchedule}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          )}
        </div>
      </div>
      
      {showFilters && showFiltersPanel && (
        <div className="mb-4 p-4 border border-gray-100 rounded-lg bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 items-end mb-2">
            <div className="w-full sm:w-1/3">
              <label className="block text-sm font-medium mb-1">Employee</label>
              <Select
                value={selectedEmployee}
                onValueChange={setSelectedEmployee}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by employee" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Employees</SelectItem>
                  {uniqueEmployees.map(empId => (
                    <SelectItem key={empId} value={empId}>
                      {employeeNames[empId] || 'Unknown'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full sm:w-2/3">
              <label className="block text-sm font-medium mb-1">Date Range</label>
              <DateRangePicker 
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </div>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="flex items-center"
              >
                <X className="h-4 w-4 mr-1" />
                Reset
              </Button>
            )}
          </div>
          
          <div className="text-sm text-gray-500 mt-2">
            {hasActiveFilters ? (
              <p>
                Showing {sortedSchedules.length} of {schedules.length} schedules
                {selectedEmployee !== 'all' && ` for ${employeeNames[selectedEmployee] || 'Unknown'}`}
                {dateRange?.from && ` from ${format(dateRange.from, 'PP')}`}
                {dateRange?.to && ` to ${format(dateRange.to, 'PP')}`}
              </p>
            ) : (
              <p>No filters applied. Showing all schedules.</p>
            )}
          </div>
        </div>
      )}
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : sortedSchedules.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            {hasActiveFilters 
              ? "No schedule items match the current filters" 
              : "No schedule items found"}
          </p>
        ) : (
          sortedSchedules.map((schedule) => (
            <div 
              key={schedule.id} 
              className="flex items-start border-l-4 border-blue-500 pl-4 py-2"
            >
              <div className="mr-4 mt-1">
                <Clock className="h-5 w-5 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="font-medium">{schedule.title}</h3>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(schedule.start_time), 'h:mm a')} - {format(parseISO(schedule.end_time), 'h:mm a')}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(parseISO(schedule.start_time), 'EEE, MMM d, yyyy')}
                    </p>
                    {employeeNames[schedule.employee_id] && (
                      <p className="text-sm text-gray-500">
                        Assigned to: {employeeNames[schedule.employee_id]}
                      </p>
                    )}
                    {schedule.status && (
                      <span className={cn(
                        "inline-block px-2 py-1 rounded-full text-xs font-medium mt-2",
                        schedule.status === 'pending' && "bg-orange-100 text-orange-700",
                        schedule.status === 'employee_accepted' && "bg-green-100 text-green-700",
                        schedule.status === 'employee_rejected' && "bg-red-100 text-red-700"
                      )}>
                        {schedule.status === 'pending' && 'Awaiting Response'}
                        {schedule.status === 'employee_accepted' && 'Confirmed'}
                        {schedule.status === 'employee_rejected' && 'Rejected'}
                        {!['pending', 'employee_accepted', 'employee_rejected'].includes(schedule.status) && schedule.status}
                      </span>
                    )}
                  </div>
                  
                  {schedule.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShiftResponse(schedule.id, 'accepted')}
                        disabled={respondToShift.isPending}
                        className="bg-green-50 hover:bg-green-100 border-green-200 text-green-700 hover:text-green-800"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleShiftResponse(schedule.id, 'rejected')}
                        disabled={respondToShift.isPending}
                        className="bg-red-50 hover:bg-red-100 border-red-200 text-red-700 hover:text-red-800"
                      >
                        <XIcon className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScheduleList;
