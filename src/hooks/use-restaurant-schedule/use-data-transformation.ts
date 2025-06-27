
import { useMemo } from 'react';
import { Employee as SupabaseEmployee } from '@/types/supabase/employees';
import { Schedule } from '@/types/supabase/schedules';
import { Employee, Shift } from '@/types/restaurant-schedule';

export const useDataTransformation = (
  employeesData: SupabaseEmployee[], 
  schedulesData: Schedule[]
) => {
  // Transform employees from database format to restaurant schedule format
  const employees = useMemo(() => {
    console.log('Raw employees data:', employeesData);
    
    if (!employeesData || employeesData.length === 0) {
      console.log('No employees data available');
      return [];
    }

    return employeesData.map((emp): Employee => ({
      id: emp.id,
      name: emp.name,
      role: emp.job_title || emp.role || 'Employee',
      color: `#${Math.floor(Math.random()*16777215).toString(16)}`, // Generate random color
      hourlyRate: emp.hourly_rate || 15,
      maxHours: 40,
      avatarUrl: emp.avatar || emp.avatar_url,
      availability: {
        monday: { 
          available: emp.monday_available !== false, 
          start: emp.monday_start_time || '09:00', 
          end: emp.monday_end_time || '17:00' 
        },
        tuesday: { 
          available: emp.tuesday_available !== false, 
          start: emp.tuesday_start_time || '09:00', 
          end: emp.tuesday_end_time || '17:00' 
        },
        wednesday: { 
          available: emp.wednesday_available !== false, 
          start: emp.wednesday_start_time || '09:00', 
          end: emp.wednesday_end_time || '17:00' 
        },
        thursday: { 
          available: emp.thursday_available !== false, 
          start: emp.thursday_start_time || '09:00', 
          end: emp.thursday_end_time || '17:00' 
        },
        friday: { 
          available: emp.friday_available !== false, 
          start: emp.friday_start_time || '09:00', 
          end: emp.friday_end_time || '17:00' 
        },
        saturday: { 
          available: emp.saturday_available !== false, 
          start: emp.saturday_start_time || '09:00', 
          end: emp.saturday_end_time || '17:00' 
        },
        sunday: { 
          available: emp.sunday_available !== false, 
          start: emp.sunday_start_time || '09:00', 
          end: emp.sunday_end_time || '17:00' 
        }
      }
    }));
  }, [employeesData]);

  // Transform schedules to shifts
  const shifts = useMemo(() => {
    if (!schedulesData || schedulesData.length === 0) {
      return [];
    }

    return schedulesData.map((schedule): Shift => {
      const startTime = new Date(schedule.start_time);
      const endTime = new Date(schedule.end_time);
      
      // Get day name from the date
      const dayName = startTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      
      return {
        id: schedule.id,
        employeeId: schedule.employee_id || '',
        day: dayName,
        startTime: startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        endTime: endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        role: schedule.title || 'General',
        notes: schedule.notes || '',
        status: schedule.status || 'confirmed',
        hasBreak: schedule.break_duration ? schedule.break_duration > 0 : false,
        breakDuration: schedule.break_duration || 0
      };
    });
  }, [schedulesData]);

  console.log('Transformed employees:', employees);
  console.log('Transformed shifts:', shifts);

  return { employees, shifts };
};
