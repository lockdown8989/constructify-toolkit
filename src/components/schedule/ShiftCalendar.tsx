
import React, { useState, useEffect } from 'react';
import { useSchedules } from '@/hooks/use-schedules';
import { format, addDays, startOfWeek, isToday } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth';
import { Check, MessageSquare, Plus } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import ShiftCalendarHeader from './components/ShiftCalendarHeader';
import ShiftCalendarToolbar from './components/ShiftCalendarToolbar';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import EmployeeShift from './components/EmployeeShift';

const ShiftCalendar = () => {
  const { user, isAdmin, isHR, isManager } = useAuth();
  const { data: schedules = [], isLoading } = useSchedules();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleDays, setVisibleDays] = useState<Date[]>([]);
  const [locationName, setLocationName] = useState("The Swan Inn");
  const isMobile = useIsMobile();
  const { toast } = useToast();
  
  // Calculate visible days (e.g., Friday & Saturday in the design)
  useEffect(() => {
    const startOfCurrentWeek = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start from Monday
    const days = [];
    
    // For mobile, show 2 days at a time
    const daysToShow = isMobile ? 2 : 7;
    
    for (let i = 0; i < daysToShow; i++) {
      days.push(addDays(startOfCurrentWeek, i));
    }
    
    setVisibleDays(days);
  }, [selectedDate, isMobile]);
  
  // Group employees and their schedules
  const groupedSchedules = schedules.reduce((groups: Record<string, any>, schedule) => {
    const employeeId = schedule.employee_id;
    
    if (!groups[employeeId]) {
      groups[employeeId] = {
        employeeId,
        employeeName: '', // Will be filled later
        shifts: []
      };
    }
    
    groups[employeeId].shifts.push(schedule);
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
  
  // Get all employees with schedules, with current user first
  const allEmployeeSchedules = [
    currentUserSchedule,
    ...employeeSchedules.filter((e: any) => e.employeeId !== user?.id)
  ];
  
  const handleNextDays = () => {
    setSelectedDate(addDays(selectedDate, isMobile ? 2 : 7));
  };
  
  const handlePreviousDays = () => {
    setSelectedDate(addDays(selectedDate, isMobile ? -2 : -7));
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

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow overflow-hidden">
      {/* Location header */}
      <ShiftCalendarHeader 
        locationName={locationName} 
        setLocationName={setLocationName} 
      />
      
      {/* Day selector toolbar */}
      <ShiftCalendarToolbar 
        visibleDays={visibleDays} 
        onNext={handleNextDays}
        onPrevious={handlePreviousDays}
        isMobile={isMobile}
      />
      
      {/* Main grid */}
      <div className="overflow-y-auto flex-1">
        <div className="min-w-[400px]">
          {/* Employees and shifts grid */}
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
        </div>
      </div>
      
      {/* Bottom navigation */}
      <div className="border-t border-gray-200 px-2 py-3 flex justify-around">
        <button className="flex flex-col items-center text-gray-500">
          <div className="h-6 w-6 mb-1">🏠</div>
          <span className="text-xs">Home</span>
        </button>
        <button className="flex flex-col items-center text-blue-500">
          <div className="h-6 w-6 mb-1">🗓️</div>
          <span className="text-xs">Schedule</span>
        </button>
        <button className="flex flex-col items-center text-gray-500 relative">
          <div className="h-6 w-6 mb-1">👥</div>
          <span className="text-xs">Team</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <div className="h-6 w-6 mb-1">🚀</div>
          <span className="text-xs">Tasks</span>
        </button>
        <button className="flex flex-col items-center text-gray-500">
          <div className="h-6 w-6 mb-1">⏱️</div>
          <span className="text-xs">Time</span>
        </button>
      </div>
    </div>
  );
};

export default ShiftCalendar;
