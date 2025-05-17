
import React, { useState, useEffect } from 'react';
import { useSchedules } from '@/hooks/use-schedules';
import { format, addDays, startOfWeek, isToday, isSameWeek, parseISO } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/use-auth';
import { ChevronLeft, ChevronRight, Check, MessageSquare, Plus, Calendar as CalendarIcon, UserPlus, SwapHorizontal } from 'lucide-react';
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
import ShiftActionsMenu from './ShiftActionsMenu';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ShiftCalendar = () => {
  const { user, isAdmin, isHR, isManager } = useAuth();
  const { data: schedules = [], isLoading, refetch } = useSchedules();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [visibleDays, setVisibleDays] = useState<Date[]>([]);
  const [locationName, setLocationName] = useState("Main Location");
  const [searchQuery, setSearchQuery] = useState('');
  const [weekView, setWeekView] = useState(true);
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [isSwapShiftOpen, setIsSwapShiftOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [selectedShift, setSelectedShift] = useState<string | null>(null);
  
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
  
  const handleAddShift = (date: Date) => {
    setSelectedDay(date);
    setIsAddShiftOpen(true);
    
    if (isMobile) {
      // For mobile, we'll use a sheet instead of a popover
      setIsAddShiftOpen(true);
    } else {
      toast({
        title: "Add shift",
        description: `Adding shift for employee on ${format(date, 'EEEE, MMM d')}`,
      });
    }
  };
  
  const handleSwapShift = (date: Date) => {
    setSelectedDay(date);
    setIsSwapShiftOpen(true);
    
    if (isMobile) {
      // For mobile, we'll use a sheet
      setIsSwapShiftOpen(true);
    } else {
      toast({
        title: "Swap shift",
        description: `Swapping shifts between employees on ${format(date, 'EEEE, MMM d')}`,
      });
    }
  };
  
  const handleSubmitAddShift = () => {
    if (selectedDay && selectedEmployee) {
      toast({
        title: "Shift added",
        description: `Shift added for ${employees.find(e => e.id === selectedEmployee)?.name || 'employee'} on ${format(selectedDay, 'MMM d, yyyy')}`,
      });
      setIsAddShiftOpen(false);
      setSelectedEmployee(null);
    }
  };
  
  const handleSubmitSwapShift = () => {
    if (selectedDay && selectedShift && selectedEmployee) {
      toast({
        title: "Shift swapped",
        description: `Shift swapped with ${employees.find(e => e.id === selectedEmployee)?.name || 'employee'} on ${format(selectedDay, 'MMM d, yyyy')}`,
      });
      setIsSwapShiftOpen(false);
      setSelectedShift(null);
      setSelectedEmployee(null);
    }
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
        
        {/* Mobile Add Shift Sheet */}
        <Sheet open={isAddShiftOpen} onOpenChange={setIsAddShiftOpen}>
          <SheetContent side="bottom" className="h-[75%] pb-0 rounded-t-xl">
            <SheetHeader className="text-left pb-4">
              <SheetTitle className="text-xl">Add Shift</SheetTitle>
              <SheetDescription>
                {selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : 'Select a date'}
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-4 pb-20">
              <div className="space-y-2">
                <Label htmlFor="employee">Employee</Label>
                <select 
                  id="employee"
                  className="w-full p-2 border rounded-md"
                  value={selectedEmployee || ''}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Select an employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input type="time" id="start-time" defaultValue="09:00" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="end-time">End Time</Label>
                  <Input type="time" id="end-time" defaultValue="17:00" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <textarea 
                  id="notes"
                  className="w-full p-2 border rounded-md min-h-[80px]"
                  placeholder="Add any notes about this shift"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t fixed bottom-0 left-0 right-0 bg-white p-4 rounded-t-xl">
              <Button 
                variant="outline" 
                onClick={() => setIsAddShiftOpen(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitAddShift} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Add Shift
              </Button>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Mobile Swap Shift Sheet */}
        <Sheet open={isSwapShiftOpen} onOpenChange={setIsSwapShiftOpen}>
          <SheetContent side="bottom" className="h-[75%] pb-0 rounded-t-xl">
            <SheetHeader className="text-left pb-4">
              <SheetTitle className="text-xl">Swap Shift</SheetTitle>
              <SheetDescription>
                {selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : 'Select a date'}
              </SheetDescription>
            </SheetHeader>
            
            <div className="space-y-4 pb-20">
              <div className="space-y-2">
                <Label htmlFor="shift">Select Shift to Swap</Label>
                <select 
                  id="shift"
                  className="w-full p-2 border rounded-md"
                  value={selectedShift || ''}
                  onChange={(e) => setSelectedShift(e.target.value)}
                >
                  <option value="">Select a shift</option>
                  {schedules.map(schedule => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.title} ({format(parseISO(schedule.start_time), 'h:mm a')} - {format(parseISO(schedule.end_time), 'h:mm a')})
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="swap-employee">Swap With Employee</Label>
                <select 
                  id="swap-employee"
                  className="w-full p-2 border rounded-md"
                  value={selectedEmployee || ''}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                >
                  <option value="">Select an employee</option>
                  {employees.map(employee => (
                    <option key={employee.id} value={employee.id}>{employee.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="swap-notes">Reason for Swap (optional)</Label>
                <textarea 
                  id="swap-notes"
                  className="w-full p-2 border rounded-md min-h-[80px]"
                  placeholder="Explain why you're requesting this swap"
                />
              </div>
            </div>
            
            <div className="flex gap-2 pt-4 border-t fixed bottom-0 left-0 right-0 bg-white p-4 rounded-t-xl">
              <Button 
                variant="outline" 
                onClick={() => setIsSwapShiftOpen(false)} 
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmitSwapShift} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Request Swap
              </Button>
            </div>
          </SheetContent>
        </Sheet>
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
      <div className={`${isMobile ? 'p-3' : 'p-4'} flex flex-wrap justify-between items-center border-b`}>
        <div className="flex items-center mb-2 sm:mb-0">
          <CalendarIcon className="h-5 w-5 mr-2 text-gray-600" />
          <span className="font-medium">{format(selectedDate, 'MMMM d, yyyy')}</span>
        </div>
        
        <div className={`flex ${isMobile ? 'flex-col w-full gap-2' : 'items-center gap-4'}`}>
          <ShiftCalendarToolbar 
            viewType={weekView ? 'week' : 'day'} 
            onViewTypeChange={(type) => setWeekView(type === 'week')}
          />
          
          <div className={`flex items-center ${isMobile ? 'justify-between w-full' : 'gap-2'}`}>
            <Button variant="ghost" size="sm" onClick={handleToday}>
              Today
            </Button>
            
            <div className="flex items-center">
              <Button variant="ghost" size="sm" onClick={handlePreviousPeriod} className="h-8 w-8 p-0 mr-1">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <Button variant="ghost" size="sm" onClick={handleNextPeriod} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
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
              <ShiftActionsMenu
                date={day}
                onAddShift={handleAddShift}
                onSwapShift={handleSwapShift}
                triggerClassName="flex items-center justify-center h-6 cursor-pointer"
                disabled={!isManager && !isAdmin && !isHR}
              />
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
        <div>{/* ... keep existing code */}</div>
      </div>
      
      {/* Desktop popover for Add Shift */}
      <Popover open={isAddShiftOpen && !isMobile} onOpenChange={setIsAddShiftOpen}>
        <PopoverContent className="w-80 p-4" align="center">
          <h3 className="text-lg font-medium mb-1">Add Shift</h3>
          <p className="text-sm text-gray-500 mb-4">
            {selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : 'Select a date'}
          </p>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="desktop-employee">Employee</Label>
              <select 
                id="desktop-employee"
                className="w-full p-2 border rounded-md"
                value={selectedEmployee || ''}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Select an employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>{employee.name}</option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="desktop-start-time">Start Time</Label>
                <Input type="time" id="desktop-start-time" defaultValue="09:00" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="desktop-end-time">End Time</Label>
                <Input type="time" id="desktop-end-time" defaultValue="17:00" />
              </div>
            </div>
            
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsAddShiftOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmitAddShift}>
                Add Shift
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Desktop popover for Swap Shift */}
      <Popover open={isSwapShiftOpen && !isMobile} onOpenChange={setIsSwapShiftOpen}>
        <PopoverContent className="w-80 p-4" align="center">
          <h3 className="text-lg font-medium mb-1">Swap Shift</h3>
          <p className="text-sm text-gray-500 mb-4">
            {selectedDay ? format(selectedDay, 'EEEE, MMMM d, yyyy') : 'Select a date'}
          </p>
          
          <div className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="desktop-shift">Select Shift to Swap</Label>
              <select 
                id="desktop-shift"
                className="w-full p-2 border rounded-md"
                value={selectedShift || ''}
                onChange={(e) => setSelectedShift(e.target.value)}
              >
                <option value="">Select a shift</option>
                {schedules.map(schedule => (
                  <option key={schedule.id} value={schedule.id}>
                    {schedule.title} ({format(parseISO(schedule.start_time), 'h:mm a')} - {format(parseISO(schedule.end_time), 'h:mm a')})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="desktop-swap-employee">Swap With Employee</Label>
              <select 
                id="desktop-swap-employee"
                className="w-full p-2 border rounded-md"
                value={selectedEmployee || ''}
                onChange={(e) => setSelectedEmployee(e.target.value)}
              >
                <option value="">Select an employee</option>
                {employees.map(employee => (
                  <option key={employee.id} value={employee.id}>{employee.name}</option>
                ))}
              </select>
            </div>
            
            <div className="pt-2 flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsSwapShiftOpen(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmitSwapShift}>
                Request Swap
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ShiftCalendar;
