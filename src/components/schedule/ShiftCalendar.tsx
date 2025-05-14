
import React, { useState, useEffect } from 'react';
import { useSchedules } from '@/hooks/use-schedules';
import { format, addDays, startOfWeek, isToday, isSameWeek } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/auth';
import { ChevronLeft, ChevronRight, Check, MessageSquare, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ScheduleHeader from '@/components/restaurant/ScheduleHeader';
import ShiftCalendarToolbar from './components/ShiftCalendarToolbar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import EmployeeShift from './components/EmployeeShift';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import MobileScheduleView from './MobileScheduleView';
import { Employee } from '@/types/restaurant-schedule';

const ShiftCalendar = () => {
  const { user, isAdmin, isHR, isManager } = useAuth();
  const { data: schedules = [], isLoading, refetch } = useSchedules();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleDays, setVisibleDays] = useState<Date[]>([]);
  const [locationName, setLocationName] = useState("Main Location");
  const [searchQuery, setSearchQuery] = useState('');
  const [weekView, setWeekView] = useState(true);
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { refreshSchedules } = useEmployeeSchedule();
  
  // Sample employee data for demo - in real app this would come from a hook/API
  const [employees, setEmployees] = useState<Employee[]>([
    { id: "emp1", name: "Courtney Henry", role: "Front of house", hourlyRate: 15 },
    { id: "emp2", name: "Alex Jackson", role: "Waiting Staff", hourlyRate: 12 },
    { id: "emp3", name: "Esther Howarde", role: "Waiting Staff", hourlyRate: 12 },
    { id: "emp4", name: "Guy Hawkins", role: "Waiting Staff", hourlyRate: 12 },
    { id: "emp5", name: "Jacob Jones", role: "Marketing", hourlyRate: 18 },
    { id: "emp6", name: "Jerome Bell", role: "Waiting Staff", hourlyRate: 12 },
    { id: "emp7", name: "Leslie Alexander", role: "Chef", hourlyRate: 20 },
    { id: "emp8", name: "Marvin McKinney", role: "Chef", hourlyRate: 22 }
  ]);
  
  // Calculate visible days based on the view type
  useEffect(() => {
    const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start from Monday
    const days = [];
    
    if (weekView) {
      // For week view, show 7 days or fewer on mobile
      const daysToShow = isMobile ? 4 : 7;
      
      for (let i = 0; i < daysToShow; i++) {
        days.push(addDays(startOfCurrentWeek, i));
      }
    } else {
      // For day view, only show the selected date
      days.push(selectedDate);
    }
    
    setVisibleDays(days);
  }, [selectedDate, isMobile, weekView]);
  
  // Filter and group employees and their schedules
  const filteredSchedules = schedules.filter(schedule => {
    // Apply search filter
    if (searchQuery) {
      const title = schedule.title?.toLowerCase() || '';
      return title.includes(searchQuery.toLowerCase());
    }
    return true;
  });
  
  // Group by employee
  const groupedSchedules = filteredSchedules.reduce((groups: Record<string, any>, schedule) => {
    const employeeId = schedule.employee_id;
    
    if (!groups[employeeId]) {
      groups[employeeId] = {
        employeeId,
        employeeName: '', // Will be filled later
        shifts: []
      };
    }
    
    // Only include shifts for visible days if in week view
    if (weekView) {
      const scheduleDate = new Date(schedule.start_time);
      const isVisible = visibleDays.some(day => 
        day.getDate() === scheduleDate.getDate() &&
        day.getMonth() === scheduleDate.getMonth() &&
        day.getFullYear() === scheduleDate.getFullYear()
      );
      
      if (isVisible) {
        groups[employeeId].shifts.push(schedule);
      }
    } else {
      // For day view, only include shifts for the selected date
      const scheduleDate = new Date(schedule.start_time);
      const selectedDateCopy = new Date(selectedDate);
      
      if (scheduleDate.getDate() === selectedDateCopy.getDate() &&
          scheduleDate.getMonth() === selectedDateCopy.getMonth() &&
          scheduleDate.getFullYear() === selectedDateCopy.getFullYear()) {
        groups[employeeId].shifts.push(schedule);
      }
    }
    
    return groups;
  }, {});
  
  // Add employee names
  const employeeSchedules = Object.values(groupedSchedules).map((group: any) => {
    // Try to find employee name from the schedule if available
    const anySchedule = group.shifts[0];
    if (anySchedule?.title) {
      const titleParts = anySchedule.title.split(' - ');
      if (titleParts.length > 1) {
        group.employeeName = titleParts[0];
        group.role = titleParts[1];
      } else {
        group.employeeName = anySchedule.title;
      }
    }
    
    return group;
  });
  
  // Add yourself at the top
  const currentUserSchedule = {
    employeeId: user?.id || 'current',
    employeeName: 'You',
    isCurrentUser: true,
    shifts: schedules.filter(s => s.employee_id === user?.id)
  };
  
  // Get all employees with schedules, with current user first if they have shifts
  const currentUserHasShifts = currentUserSchedule.shifts.length > 0;
  const allEmployeeSchedules = currentUserHasShifts 
    ? [currentUserSchedule, ...employeeSchedules.filter((e: any) => e.employeeId !== user?.id)]
    : [...employeeSchedules];
  
  const handleNextPeriod = () => {
    if (weekView) {
      setSelectedDate(addDays(selectedDate, 7));
    } else {
      setSelectedDate(addDays(selectedDate, 1));
    }
  };
  
  const handlePreviousPeriod = () => {
    if (weekView) {
      setSelectedDate(addDays(selectedDate, -7));
    } else {
      setSelectedDate(addDays(selectedDate, -1));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };
  
  const handleAddShift = (employeeId: string, day: Date) => {
    toast({
      title: "Add shift",
      description: `Adding shift for employee on ${format(day, 'EEEE, MMM d')}`,
    });
  };

  const handleShiftClick = (shift: any) => {
    toast({
      title: "Shift details",
      description: `${shift.title} (${format(new Date(shift.start_time), 'h:mm a')} - ${format(new Date(shift.end_time), 'h:mm a')})`,
    });
  };

  const handleRefresh = () => {
    refetch();
    refreshSchedules();
    toast({
      title: "Schedule refreshed",
      description: "The schedule has been updated with the latest information.",
    });
  };

  // If on mobile, render the mobile schedule view
  if (isMobile) {
    return (
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <ScheduleHeader 
          locationName={locationName} 
          setLocationName={setLocationName}
          onSearch={setSearchQuery}
          searchQuery={searchQuery}
          weekView={weekView}
          setWeekView={setWeekView}
        />
        <MobileScheduleView 
          schedules={schedules}
          employees={employees}
          onAddShift={handleAddShift}
          onShiftClick={handleShiftClick}
        />
      </div>
    );
  }

  // Desktop view (existing implementation)
  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {/* Custom header with location name */}
      <ScheduleHeader 
        locationName={locationName} 
        setLocationName={setLocationName}
        onSearch={setSearchQuery}
        searchQuery={searchQuery}
        weekView={weekView}
        setWeekView={setWeekView}
      />
      
      {/* Day selector toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-gray-50">
        <Button variant="ghost" size="sm" onClick={handlePreviousPeriod} className="h-8 w-8 p-0">
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={handleToday}>
            Today
          </Button>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
        
        <Button variant="ghost" size="sm" onClick={handleNextPeriod} className="h-8 w-8 p-0">
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Date column headers */}
      <div className="flex border-b border-gray-200">
        <div className="w-[120px] p-2 flex items-center justify-center bg-gray-50 border-r border-gray-200">
          <span className="font-medium text-sm">Employees</span>
        </div>
        
        {visibleDays.map(day => {
          const isCurrentDay = isToday(day);
          return (
            <div 
              key={format(day, 'yyyy-MM-dd')} 
              className={`flex-1 p-2 text-center ${isCurrentDay ? 'bg-blue-50' : ''}`}
            >
              <div className="text-xs uppercase text-gray-500">{format(day, 'EEE')}</div>
              <div className={`font-semibold ${isCurrentDay ? 'text-blue-600' : ''}`}>
                {format(day, 'd')}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Main grid */}
      <div className="overflow-y-auto flex-1">
        <div className="min-w-[400px]">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading schedules...</div>
          ) : allEmployeeSchedules.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No schedules found for the selected period</div>
          ) : (
            /* Employees and shifts grid */
            <div className="divide-y divide-gray-200">
              {allEmployeeSchedules.map((employee: any) => (
                <div key={employee.employeeId} className="flex">
                  {/* Employee name column */}
                  <div className="w-[120px] p-3 bg-gray-50 flex flex-col justify-center items-center text-center border-r border-gray-200">
                    {employee.isCurrentUser ? (
                      <div className="bg-gray-800 text-white px-3 py-1 rounded-md text-sm font-medium mb-1">
                        You
                      </div>
                    ) : (
                      <Avatar className="h-8 w-8 mb-1">
                        <AvatarFallback className="bg-blue-100 text-blue-800">
                          {employee.employeeName.split(' ').map((n: string) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="font-medium text-sm">{employee.employeeName}</div>
                    {employee.role && (
                      <div className="text-xs text-gray-500 truncate max-w-[110px]">
                        {employee.role}
                      </div>
                    )}
                  </div>
                  
                  {/* Shifts columns */}
                  <div className="flex flex-grow divide-x divide-gray-200">
                    {visibleDays.map(day => {
                      // Find shifts for this employee on this day
                      const dayShifts = employee.shifts.filter((shift: any) => {
                        const shiftDate = new Date(shift.start_time);
                        return (
                          shiftDate.getDate() === day.getDate() &&
                          shiftDate.getMonth() === day.getMonth() &&
                          shiftDate.getFullYear() === day.getFullYear()
                        );
                      });
                      
                      const isDayToday = isToday(day);
                      
                      // Generate a consistent color based on employee name
                      const colorIndex = employee.employeeName.charCodeAt(0) % 5;
                      const colorClasses = [
                        'bg-blue-50 border-l-4 border-blue-500', // Blue
                        'bg-yellow-50 border-l-4 border-yellow-500', // Yellow
                        'bg-green-50 border-l-4 border-green-500', // Green
                        'bg-pink-50 border-l-4 border-pink-500', // Pink
                        'bg-purple-50 border-l-4 border-purple-500' // Purple
                      ];
                      const colorClass = colorClasses[colorIndex];
                      
                      return (
                        <div 
                          key={format(day, 'yyyy-MM-dd')} 
                          className={cn(
                            "w-full h-full min-h-[120px] p-2 relative",
                            isDayToday ? "bg-blue-50/30" : ""
                          )}
                        >
                          {dayShifts.length > 0 ? (
                            <div className="space-y-2 h-full">
                              {dayShifts.map((shift: any) => (
                                <EmployeeShift 
                                  key={shift.id}
                                  shift={shift}
                                  colorClass={colorClass}
                                  onClick={() => handleShiftClick(shift)}
                                />
                              ))}
                            </div>
                          ) : (
                            <div className={cn(
                              "h-full flex items-center justify-center",
                              (isAdmin || isManager || isHR) && "cursor-pointer hover:bg-gray-50"
                            )}>
                              {(isAdmin || isManager || isHR) && (
                                <button
                                  onClick={() => handleAddShift(employee.employeeId, day)}
                                  className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-200 active:bg-gray-300"
                                >
                                  <Plus className="h-5 w-5 text-gray-400" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Display information about schedule updates */}
      <div className="border-t border-gray-200 p-3 flex justify-between items-center bg-gray-50 text-sm text-gray-500">
        <div>Last updated: {format(new Date(), 'MMM d, yyyy h:mm a')}</div>
        <div>{allEmployeeSchedules.length} employees</div>
      </div>
    </div>
  );
};

export default ShiftCalendar;
