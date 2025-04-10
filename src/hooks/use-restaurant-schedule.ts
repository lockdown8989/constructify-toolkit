
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Employee, 
  Shift, 
  OpenShift, 
  WeekStats, 
  DayStats, 
  ViewMode, 
  StaffRole 
} from '@/types/restaurant-schedule';

// Sample data for the restaurant schedule
const SAMPLE_EMPLOYEES: Employee[] = [
  { id: '1', name: 'Eleanor Pena', role: 'Kitchen Manager', avatarUrl: '/placeholder.svg', hourlyRate: 18.50 },
  { id: '2', name: 'John Lane', role: 'Head Chef', avatarUrl: '/placeholder.svg', hourlyRate: 22.00 },
  { id: '3', name: 'Leslie Alexander', role: 'Chef', avatarUrl: '/placeholder.svg', hourlyRate: 16.75 },
  { id: '4', name: 'Ronald Richards', role: 'Waiting Staff', avatarUrl: '/placeholder.svg', hourlyRate: 12.50 },
  { id: '5', name: 'Maria Rodriguez', role: 'Bartender', avatarUrl: '/placeholder.svg', hourlyRate: 14.00 },
  { id: '6', name: 'Sam Johnson', role: 'Host', avatarUrl: '/placeholder.svg', hourlyRate: 13.25 },
];

const SAMPLE_SHIFTS: Shift[] = [
  { id: '1', employeeId: '1', day: 'monday', startTime: '07:00', endTime: '12:00', role: 'Kitchen Manager' },
  { id: '2', employeeId: '1', day: 'tuesday', startTime: '16:00', endTime: '23:00', role: 'Kitchen Manager' },
  { id: '3', employeeId: '2', day: 'monday', startTime: '12:00', endTime: '23:00', role: 'Head Chef' },
  { id: '4', employeeId: '2', day: 'tuesday', startTime: '07:00', endTime: '12:00', role: 'Head Chef' },
  { id: '5', employeeId: '3', day: 'monday', startTime: '16:00', endTime: '22:30', role: 'Chef', hasBreak: true, breakDuration: 30 },
  { id: '6', employeeId: '3', day: 'tuesday', startTime: '08:00', endTime: '18:00', role: 'Chef', isUnavailable: true, unavailabilityReason: 'vacation' },
  { id: '7', employeeId: '4', day: 'monday', startTime: '07:00', endTime: '12:00', role: 'Waiting Staff' },
  { id: '8', employeeId: '4', day: 'tuesday', startTime: '08:00', endTime: '18:00', role: 'Waiting Staff', isUnavailable: true, unavailabilityReason: 'vacation' },
];

const SAMPLE_OPEN_SHIFTS: OpenShift[] = [
  { id: '1', day: 'monday', startTime: '16:00', endTime: '23:00', role: 'Bar Staff' },
  { id: '2', day: 'tuesday', startTime: '07:00', endTime: '19:00', role: 'Waiting Staff' },
];

// Helper function to calculate hours between two time strings
const calculateHours = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const totalStartMinutes = startHour * 60 + startMinute;
  const totalEndMinutes = endHour * 60 + endMinute;
  
  return (totalEndMinutes - totalStartMinutes) / 60;
};

export const useRestaurantSchedule = (initialWeekNumber: number = 17, initialViewMode: ViewMode = 'week') => {
  const [employees, setEmployees] = useState<Employee[]>(SAMPLE_EMPLOYEES);
  const [shifts, setShifts] = useState<Shift[]>(SAMPLE_SHIFTS);
  const [openShifts, setOpenShifts] = useState<OpenShift[]>(SAMPLE_OPEN_SHIFTS);
  const [weekNumber, setWeekNumber] = useState<number>(initialWeekNumber);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);
  const { toast } = useToast();

  // Group employees by role
  const staffRoles = useMemo(() => {
    const roleMap = new Map<string, StaffRole>();
    
    employees.forEach(employee => {
      if (!roleMap.has(employee.role)) {
        roleMap.set(employee.role, {
          id: employee.role.toLowerCase().replace(/\s+/g, '-'),
          name: employee.role,
          employees: [],
          totalHours: 0,
          totalShifts: 0
        });
      }
      
      const role = roleMap.get(employee.role);
      if (role) {
        role.employees.push(employee);
      }
    });
    
    // Calculate total hours and shifts for each role
    shifts.forEach(shift => {
      if (!shift.isUnavailable) {
        const employee = employees.find(e => e.id === shift.employeeId);
        if (employee) {
          const role = roleMap.get(employee.role);
          if (role) {
            const hours = calculateHours(shift.startTime, shift.endTime);
            role.totalHours += hours;
            role.totalShifts += 1;
          }
        }
      }
    });
    
    return Array.from(roleMap.values());
  }, [employees, shifts]);

  // Calculate week stats
  const weekStats = useMemo(() => {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    // Calculate day stats
    const dayStats: DayStats[] = days.map(day => {
      const dayShifts = shifts.filter(s => s.day === day && !s.isUnavailable);
      const dayOpenShifts = openShifts.filter(s => s.day === day);
      
      let totalHours = 0;
      let totalCost = 0;
      
      dayShifts.forEach(shift => {
        const employee = employees.find(e => e.id === shift.employeeId);
        if (employee) {
          const hours = calculateHours(shift.startTime, shift.endTime);
          totalHours += hours;
          totalCost += hours * employee.hourlyRate;
        }
      });
      
      return {
        day,
        totalHours,
        totalCost,
        shifts: shifts.filter(s => s.day === day),
        openShifts: dayOpenShifts
      };
    });
    
    // Calculate week totals
    const totalHours = dayStats.reduce((sum, day) => sum + day.totalHours, 0);
    const totalCost = dayStats.reduce((sum, day) => sum + day.totalCost, 0);
    
    // Calculate open shifts stats
    let openShiftsTotalHours = 0;
    openShifts.forEach(shift => {
      openShiftsTotalHours += calculateHours(shift.startTime, shift.endTime);
    });
    
    // Mock start and end dates for the week
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - startDate.getDay() + 1); // Start from Monday
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6); // End on Sunday
    
    return {
      weekNumber,
      startDate,
      endDate,
      totalHours,
      totalCost,
      days: dayStats,
      roles: staffRoles,
      openShiftsTotalHours,
      openShiftsTotalCount: openShifts.length
    } as WeekStats;
  }, [employees, shifts, openShifts, weekNumber, staffRoles]);

  // Function to add a new shift
  const addShift = (newShift: Omit<Shift, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const shift: Shift = { ...newShift, id };
    
    setShifts(prevShifts => [...prevShifts, shift]);
    
    toast({
      title: "Shift added",
      description: `New shift added for ${employees.find(e => e.id === newShift.employeeId)?.name || 'employee'}`,
    });
  };

  // Function to update a shift
  const updateShift = (updatedShift: Shift) => {
    setShifts(prevShifts => 
      prevShifts.map(shift => 
        shift.id === updatedShift.id ? updatedShift : shift
      )
    );
    
    toast({
      title: "Shift updated",
      description: "The shift has been updated successfully",
    });
  };

  // Function to remove a shift
  const removeShift = (shiftId: string) => {
    setShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftId));
    
    toast({
      title: "Shift removed",
      description: "The shift has been removed successfully",
    });
  };

  // Function to add a new open shift
  const addOpenShift = (newOpenShift: Omit<OpenShift, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const openShift: OpenShift = { ...newOpenShift, id };
    
    setOpenShifts(prevOpenShifts => [...prevOpenShifts, openShift]);
    
    toast({
      title: "Open shift added",
      description: `New open shift added for ${newOpenShift.role}`,
    });
  };

  // Function to assign an open shift to an employee
  const assignOpenShift = (openShiftId: string, employeeId: string) => {
    const openShift = openShifts.find(shift => shift.id === openShiftId);
    
    if (openShift) {
      // Create a new shift for the employee
      const newShift: Omit<Shift, 'id'> = {
        employeeId,
        day: openShift.day,
        startTime: openShift.startTime,
        endTime: openShift.endTime,
        role: openShift.role,
        notes: openShift.notes
      };
      
      addShift(newShift);
      
      // Remove the open shift
      setOpenShifts(prevOpenShifts => 
        prevOpenShifts.filter(shift => shift.id !== openShiftId)
      );
      
      toast({
        title: "Shift assigned",
        description: `Open shift assigned to ${employees.find(e => e.id === employeeId)?.name || 'employee'}`,
      });
    }
  };

  // Function to toggle between week and month views
  const toggleViewMode = () => {
    setViewMode(prevMode => prevMode === 'week' ? 'month' : 'week');
  };

  // Function to navigate to the previous week
  const previousWeek = () => {
    setWeekNumber(prev => prev - 1);
  };

  // Function to navigate to the next week
  const nextWeek = () => {
    setWeekNumber(prev => prev + 1);
  };

  return {
    employees,
    shifts,
    openShifts,
    weekStats,
    viewMode,
    addShift,
    updateShift,
    removeShift,
    addOpenShift,
    assignOpenShift,
    toggleViewMode,
    previousWeek,
    nextWeek,
    setViewMode
  };
};
