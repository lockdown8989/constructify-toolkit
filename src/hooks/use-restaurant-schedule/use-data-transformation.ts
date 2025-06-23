
import { useMemo } from 'react';
import { Employee as DBEmployee } from '@/types/supabase/employees';
import { Schedule } from '@/types/supabase/schedules';
import { Employee, Shift } from '@/types/restaurant-schedule';

export const useDataTransformation = (employeesData: DBEmployee[], schedulesData: Schedule[]) => {
  const employees = useMemo(() => {
    return employeesData.map((emp): Employee => ({
      id: emp.id,
      name: emp.name,
      role: emp.job_title,
      color: getEmployeeColor(emp.id),
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
        }
      }
    }));
  }, [employeesData]);

  const shifts = useMemo(() => {
    return schedulesData.map((schedule): Shift => {
      const startDate = new Date(schedule.start_time);
      const endDate = new Date(schedule.end_time);
      
      // Map day of week to day name
      const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const day = dayMap[startDate.getDay()];

      return {
        id: schedule.id,
        employeeId: schedule.employee_id || '',
        day,
        startTime: startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: endDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        role: schedule.title,
        notes: schedule.notes || undefined,
        status: schedule.status || 'pending'
      };
    });
  }, [schedulesData]);

  return { employees, shifts };
};

// Helper function to generate consistent colors based on employee ID
const getEmployeeColor = (employeeId: string): string => {
  const colors = [
    '#3B82F6', // Blue
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Amber
    '#8B5CF6', // Purple
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1'  // Indigo
  ];
  
  // Use a simple hash function to get consistent color for each employee
  let hash = 0;
  for (let i = 0; i < employeeId.length; i++) {
    hash = employeeId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};
