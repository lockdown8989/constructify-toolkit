
import { useMemo } from 'react';
import { Employee, Shift } from '@/types/restaurant-schedule';

export const useDataTransformation = (employeesData: any[], schedulesData: any[]) => {
  // Transform employees data to match restaurant schedule format
  const employees: Employee[] = useMemo(() => {
    return employeesData.map(emp => ({
      id: emp.id,
      name: emp.name,
      role: emp.job_title || 'Staff',
      color: '#3B82F6', // Default blue color
      hourlyRate: emp.hourly_rate || 15,
      maxHours: 40,
      availability: {
        monday: { available: emp.monday_available || false, start: emp.monday_start_time || '09:00', end: emp.monday_end_time || '17:00' },
        tuesday: { available: emp.tuesday_available || false, start: emp.tuesday_start_time || '09:00', end: emp.tuesday_end_time || '17:00' },
        wednesday: { available: emp.wednesday_available || false, start: emp.wednesday_start_time || '09:00', end: emp.wednesday_end_time || '17:00' },
        thursday: { available: emp.thursday_available || false, start: emp.thursday_start_time || '09:00', end: emp.thursday_end_time || '17:00' },
        friday: { available: emp.friday_available || false, start: emp.friday_start_time || '09:00', end: emp.friday_end_time || '17:00' },
        saturday: { available: emp.saturday_available || false, start: emp.saturday_start_time || '09:00', end: emp.saturday_end_time || '17:00' },
        sunday: { available: emp.sunday_available || false, start: emp.sunday_start_time || '09:00', end: emp.sunday_end_time || '17:00' }
      }
    }));
  }, [employeesData]);

  // Transform schedules data to match restaurant schedule format
  const shifts: Shift[] = useMemo(() => {
    return schedulesData.map(schedule => {
      const startDate = new Date(schedule.start_time);
      const endDate = new Date(schedule.end_time);
      
      // Get day of week
      const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
      const dayName = dayNames[startDate.getDay()];
      
      return {
        id: schedule.id,
        employeeId: schedule.employee_id,
        day: dayName,
        startTime: startDate.toTimeString().slice(0, 5), // HH:MM format
        endTime: endDate.toTimeString().slice(0, 5), // HH:MM format
        role: schedule.title || 'Staff',
        notes: schedule.notes || undefined,
        break: undefined,
        status: schedule.status as any
      };
    });
  }, [schedulesData]);

  return { employees, shifts };
};
