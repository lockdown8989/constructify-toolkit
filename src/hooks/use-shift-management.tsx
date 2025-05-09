
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { Schedule } from './use-schedules';
import { useAuth } from './use-auth';

export type ShiftsByDepartment = {
  [department: string]: {
    name: string;
    isOpen: boolean;
    employees: {
      [employeeId: string]: {
        name: string;
        role: string;
        hours: number;
        shifts: Record<string, Schedule[]>;
        avatar?: string;
      }
    }
  }
};

export function useShiftManagement(schedules: Schedule[]) {
  const { user, isManager } = useAuth();
  const [shiftsByDepartment, setShiftsByDepartment] = useState<ShiftsByDepartment>({
    kitchen: { name: 'KITCHEN STAFF', isOpen: true, employees: {} },
    service: { name: 'SERVICE STAFF', isOpen: true, employees: {} },
    admin: { name: 'ADMIN STAFF', isOpen: false, employees: {} },
  });

  // Function to determine the department based on role
  const getDepartmentForRole = (role: string): string => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('chef') || roleLower.includes('cook') || roleLower.includes('kitchen')) {
      return 'kitchen';
    } else if (roleLower.includes('waiter') || roleLower.includes('host') || roleLower.includes('bartender') || roleLower.includes('server')) {
      return 'service';
    } else {
      return 'admin';
    }
  };

  // Group schedules by employee and departments
  const organizeSchedules = () => {
    const result: ShiftsByDepartment = {
      kitchen: { name: 'KITCHEN STAFF', isOpen: true, employees: {} },
      service: { name: 'SERVICE STAFF', isOpen: true, employees: {} },
      admin: { name: 'ADMIN STAFF', isOpen: false, employees: {} },
    };
    
    schedules.forEach(schedule => {
      try {
        const employeeId = schedule.employee_id;
        const roleFromTitle = schedule.title.split(' ').slice(1).join(' ');
        const employeeName = schedule.title.split(' ')[0] || 'Employee';
        const role = roleFromTitle || 'Staff';
        const department = getDepartmentForRole(role);
        
        // Get the day key for this schedule
        const scheduleDate = parseISO(schedule.start_time);
        const dayKey = format(scheduleDate, 'yyyy-MM-dd');
        
        // Initialize department if needed
        if (!result[department]) {
          result[department] = { 
            name: department.toUpperCase() + ' STAFF', 
            isOpen: true, 
            employees: {} 
          };
        }
        
        // Initialize employee record if needed
        if (!result[department].employees[employeeId]) {
          result[department].employees[employeeId] = {
            name: employeeName,
            role,
            hours: 0,
            shifts: {},
          };
        }
        
        // Initialize the day array for this employee if needed
        if (!result[department].employees[employeeId].shifts[dayKey]) {
          result[department].employees[employeeId].shifts[dayKey] = [];
        }
        
        // Add this schedule to the employee's shifts for this day
        result[department].employees[employeeId].shifts[dayKey].push(schedule);
        
        // Calculate hours worked
        const startTime = new Date(schedule.start_time);
        const endTime = new Date(schedule.end_time);
        const hoursWorked = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        result[department].employees[employeeId].hours += hoursWorked;
      } catch (error) {
        console.error('Error processing schedule:', error, schedule);
      }
    });
    
    setShiftsByDepartment(result);
  };

  // Calculate total hours for a department
  const getDepartmentTotalHours = (department: string): number => {
    let total = 0;
    const dept = shiftsByDepartment[department];
    
    if (dept) {
      Object.values(dept.employees).forEach(employee => {
        total += employee.hours;
      });
    }
    
    return total;
  };

  // Get role color class
  const getRoleColorClass = (role: string): string => {
    const roleLower = role.toLowerCase();
    if (roleLower.includes('chef') || roleLower.includes('cook')) {
      return 'bg-green-100 text-green-800 border-l-4 border-l-green-500';
    } else if (roleLower.includes('waiter') || roleLower.includes('server')) {
      return 'bg-emerald-100 text-emerald-800 border-l-4 border-l-emerald-500';
    } else if (roleLower.includes('bartender')) {
      return 'bg-blue-100 text-blue-800 border-l-4 border-l-blue-500';
    } else if (roleLower.includes('host')) {
      return 'bg-orange-100 text-orange-800 border-l-4 border-l-orange-500';
    } else if (roleLower.includes('admin') || roleLower.includes('manager')) {
      return 'bg-purple-100 text-purple-800 border-l-4 border-l-purple-500';
    }
    return 'bg-gray-100 text-gray-800 border-l-4 border-l-gray-500';
  };

  // Toggle department open/closed state
  const toggleDepartment = (departmentKey: string) => {
    setShiftsByDepartment(prev => {
      const updated = { ...prev };
      if (updated[departmentKey]) {
        updated[departmentKey].isOpen = !updated[departmentKey].isOpen;
      }
      return updated;
    });
  };

  // Format time for display (e.g., "9:00 a - 5:00 p")
  const formatShiftTime = (schedule: Schedule): string => {
    const start = new Date(schedule.start_time);
    const end = new Date(schedule.end_time);
    
    const startHour = start.getHours();
    const endHour = end.getHours();
    
    const startStr = `${startHour % 12 || 12}:00 ${startHour >= 12 ? 'p' : 'a'}`;
    const endStr = `${endHour % 12 || 12}:00 ${endHour >= 12 ? 'p' : 'a'}`;
    
    return `${startStr} - ${endStr}`;
  };
  
  // Update departments whenever schedules change
  useEffect(() => {
    organizeSchedules();
  }, [schedules]);

  return {
    shiftsByDepartment,
    toggleDepartment,
    getDepartmentTotalHours,
    getRoleColorClass,
    formatShiftTime
  };
}
