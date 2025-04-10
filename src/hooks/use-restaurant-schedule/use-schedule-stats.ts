
import { useMemo } from 'react';
import { 
  Employee, 
  Shift, 
  OpenShift, 
  WeekStats,
  StaffRole 
} from '@/types/restaurant-schedule';

// Helper function to calculate hours between two time strings
export const calculateHours = (startTime: string, endTime: string): number => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const totalStartMinutes = startHour * 60 + startMinute;
  const totalEndMinutes = endHour * 60 + endMinute;
  
  return (totalEndMinutes - totalStartMinutes) / 60;
};

export const useScheduleStats = (
  employees: Employee[],
  shifts: Shift[],
  openShifts: OpenShift[],
  weekNumber: number
) => {
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
    const dayStats = days.map(day => {
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

  return { weekStats, staffRoles };
};
