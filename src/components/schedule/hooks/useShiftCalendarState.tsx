
import { useState, useEffect } from 'react';
import { addDays, startOfWeek, format } from 'date-fns';
import { useSchedules } from '@/hooks/use-schedules';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useEmployeeSchedule } from '@/hooks/use-employee-schedule';
import { useIsMobile } from '@/hooks/use-mobile';

// Sample employee data for demo - in real app this would come from a hook/API
const DEFAULT_EMPLOYEES = [
  { id: "emp1", name: "Courtney Henry", role: "Front of house", hourlyRate: 15 },
  { id: "emp2", name: "Alex Jackson", role: "Waiting Staff", hourlyRate: 12 },
  { id: "emp3", name: "Esther Howarde", role: "Waiting Staff", hourlyRate: 12 },
  { id: "emp4", name: "Guy Hawkins", role: "Waiting Staff", hourlyRate: 12 },
  { id: "emp5", name: "Jacob Jones", role: "Marketing", hourlyRate: 18 },
  { id: "emp6", name: "Jerome Bell", role: "Waiting Staff", hourlyRate: 12 },
  { id: "emp7", name: "Leslie Alexander", role: "Chef", hourlyRate: 20 },
  { id: "emp8", name: "Marvin McKinney", role: "Chef", hourlyRate: 22 }
];

export const useShiftCalendarState = () => {
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
  
  const [employees, setEmployees] = useState(DEFAULT_EMPLOYEES);
  
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const { refreshSchedules } = useEmployeeSchedule();
  
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
  const processSchedules = () => {
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
    return currentUserHasShifts 
      ? [currentUserSchedule, ...employeeSchedules.filter((e: any) => e.employeeId !== user?.id)]
      : [...employeeSchedules];
  };
  
  const allEmployeeSchedules = processSchedules();
  
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

  // Handle adding shift to a specific employee
  const handleEmployeeAddShift = (employeeId: string, date: Date) => {
    toast({
      title: "Adding shift",
      description: `Adding shift for employee on ${format(date, 'MMM d')}`,
    });
    
    setSelectedEmployee(employeeId);
    setSelectedDay(date);
    setIsAddShiftOpen(true);
  };

  return {
    user,
    isAdmin,
    isHR,
    isManager,
    schedules,
    isLoading,
    refetch,
    selectedDate,
    visibleDays,
    locationName,
    setLocationName,
    searchQuery,
    setSearchQuery,
    weekView, 
    setWeekView,
    selectedDay,
    setSelectedDay,
    isAddShiftOpen,
    setIsAddShiftOpen,
    isSwapShiftOpen,
    setIsSwapShiftOpen,
    selectedEmployee,
    setSelectedEmployee,
    selectedShift,
    setSelectedShift,
    employees,
    isMobile,
    allEmployeeSchedules,
    handleNextPeriod,
    handlePreviousPeriod,
    handleToday,
    handleAddShift,
    handleSwapShift,
    handleSubmitAddShift,
    handleSubmitSwapShift,
    handleShiftClick,
    handleRefresh,
    handleEmployeeAddShift,
    toast,
    refreshSchedules
  };
};
