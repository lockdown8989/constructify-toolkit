
import { useMemo } from 'react';
import { Employee as RestaurantEmployee, Shift } from '@/types/restaurant-schedule';
import { Employee as DbEmployee } from '@/hooks/use-employees';

export const useDataTransformation = (employeesData: DbEmployee[], schedulesData: any[]) => {
  const employees = useMemo(() => {
    return employeesData.map((emp): RestaurantEmployee => ({
      id: emp.id,
      name: emp.name,
      role: emp.job_title || 'Staff',
      color: getEmployeeColor(emp.name),
      hourlyRate: emp.hourly_rate || 15,
      maxHours: 40,
      avatarUrl: emp.avatar || undefined,
      availability: {
        monday: { 
          available: emp.monday_available ?? true, 
          start: emp.monday_start_time || '09:00', 
          end: emp.monday_end_time || '17:00' 
        },
        tuesday: { 
          available: emp.tuesday_available ?? true, 
          start: emp.tuesday_start_time || '09:00', 
          end: emp.tuesday_end_time || '17:00' 
        },
        wednesday: { 
          available: emp.wednesday_available ?? true, 
          start: emp.wednesday_start_time || '09:00', 
          end: emp.wednesday_end_time || '17:00' 
        },
        thursday: { 
          available: emp.thursday_available ?? true, 
          start: emp.thursday_start_time || '09:00', 
          end: emp.thursday_end_time || '17:00' 
        },
        friday: { 
          available: emp.friday_available ?? true, 
          start: emp.friday_start_time || '09:00', 
          end: emp.friday_end_time || '17:00' 
        },
        saturday: { 
          available: emp.saturday_available ?? true, 
          start: emp.saturday_start_time || '09:00', 
          end: emp.saturday_end_time || '17:00' 
        },
        sunday: { 
          available: emp.sunday_available ?? true, 
          start: emp.sunday_start_time || '09:00', 
          end: emp.sunday_end_time || '17:00' 
        },
      },
    }));
  }, [employeesData]);

  const shifts = useMemo(() => {
    return schedulesData.map((schedule): Shift => ({
      id: schedule.id,
      employeeId: schedule.employee_id,
      day: getDayFromDate(schedule.start_time),
      startTime: formatTime(schedule.start_time),
      endTime: formatTime(schedule.end_time),
      role: schedule.role || 'Staff',
      notes: schedule.notes || '',
      break: schedule.break_duration || 30,
      status: schedule.status || 'pending',
    }));
  }, [schedulesData]);

  return { employees, shifts };
};

// Helper functions
function getEmployeeColor(name: string): string {
  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', 
    '#8B5CF6', '#06B6D4', '#F97316', '#84CC16'
  ];
  const hash = name.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return colors[Math.abs(hash) % colors.length];
}

function getDayFromDate(dateString: string): string {
  const date = new Date(dateString);
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getDay()];
}

function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}
