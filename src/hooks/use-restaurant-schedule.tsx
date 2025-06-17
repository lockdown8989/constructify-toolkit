
import { useState, useEffect, useMemo } from 'react';
import { Employee, Shift, OpenShift } from '@/types/restaurant-schedule';
import { useShiftManagement } from './use-restaurant-schedule/use-shift-management';
import { useWeekNavigation } from './use-restaurant-schedule/use-week-navigation';
import { useSchedules } from '@/hooks/use-schedules';
import { useEmployees } from '@/hooks/use-employees';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useRestaurantSchedule = () => {
  const [viewMode, setViewMode] = useState<'week' | 'day'>('week');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch real data from database
  const { data: schedulesData = [], isLoading: schedulesLoading, refetch: refetchSchedules } = useSchedules();
  const { data: employeesData = [], isLoading: employeesLoading } = useEmployees();

  // Week navigation
  const { currentWeek, previousWeek, nextWeek, weekStats } = useWeekNavigation();

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

  // Shift management with database integration
  const shiftManagement = useShiftManagement(employees);

  // Enhanced addShift that saves to database
  const addShift = async (newShift: Omit<Shift, 'id'>) => {
    try {
      setIsLoading(true);
      
      // Calculate the actual date for the shift
      const today = new Date();
      const currentWeekStart = new Date(today);
      currentWeekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
      
      const dayMap: Record<string, number> = {
        monday: 1, tuesday: 2, wednesday: 3, thursday: 4, 
        friday: 5, saturday: 6, sunday: 0
      };
      
      const targetDayOfWeek = dayMap[newShift.day.toLowerCase()];
      const targetDate = new Date(currentWeekStart);
      targetDate.setDate(currentWeekStart.getDate() + targetDayOfWeek);
      
      // If the target date is in the past, move to next week
      if (targetDate < today) {
        targetDate.setDate(targetDate.getDate() + 7);
      }
      
      // Parse start and end times
      const [startHour, startMinute] = newShift.startTime.split(':').map(Number);
      const [endHour, endMinute] = newShift.endTime.split(':').map(Number);
      
      const startDateTime = new Date(targetDate);
      startDateTime.setHours(startHour, startMinute, 0, 0);
      
      const endDateTime = new Date(targetDate);
      endDateTime.setHours(endHour, endMinute, 0, 0);
      
      // If end time is before start time, assume it's next day
      if (endDateTime <= startDateTime) {
        endDateTime.setDate(endDateTime.getDate() + 1);
      }

      console.log('Saving shift to database:', {
        employee_id: newShift.employeeId,
        title: newShift.role,
        start_time: startDateTime.toISOString(),
        end_time: endDateTime.toISOString()
      });

      // Save to database
      const { data, error } = await supabase
        .from('schedules')
        .insert({
          employee_id: newShift.employeeId,
          title: newShift.role,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          notes: newShift.notes || null,
          status: 'confirmed',
          published: true,
          created_platform: 'desktop',
          last_modified_platform: 'desktop',
          is_draft: false,
          can_be_edited: true
        })
        .select()
        .single();

      if (error) {
        console.error('Error saving shift:', error);
        throw error;
      }

      console.log('Shift saved successfully:', data);

      // Add to local state for immediate UI update
      shiftManagement.addShift(newShift);
      
      // Refresh schedules from database
      await refetchSchedules();
      
      toast.success('Shift saved successfully');
    } catch (error) {
      console.error('Error adding shift:', error);
      toast.error('Failed to save shift');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced updateShift that updates database
  const updateShift = async (updatedShift: Shift) => {
    try {
      setIsLoading(true);
      
      // Find the original schedule in the database
      const originalSchedule = schedulesData.find(s => s.id === updatedShift.id);
      if (!originalSchedule) {
        throw new Error('Schedule not found');
      }

      // Calculate new start and end times
      const originalDate = new Date(originalSchedule.start_time);
      const [startHour, startMinute] = updatedShift.startTime.split(':').map(Number);
      const [endHour, endMinute] = updatedShift.endTime.split(':').map(Number);
      
      const newStartTime = new Date(originalDate);
      newStartTime.setHours(startHour, startMinute, 0, 0);
      
      const newEndTime = new Date(originalDate);
      newEndTime.setHours(endHour, endMinute, 0, 0);
      
      // If end time is before start time, assume it's next day
      if (newEndTime <= newStartTime) {
        newEndTime.setDate(newEndTime.getDate() + 1);
      }

      // Update in database
      const { error } = await supabase
        .from('schedules')
        .update({
          title: updatedShift.role,
          start_time: newStartTime.toISOString(),
          end_time: newEndTime.toISOString(),
          notes: updatedShift.notes || null,
          updated_at: new Date().toISOString(),
          last_modified_platform: 'desktop'
        })
        .eq('id', updatedShift.id);

      if (error) {
        console.error('Error updating shift:', error);
        throw error;
      }

      // Update local state
      shiftManagement.updateShift(updatedShift);
      
      // Refresh schedules from database
      await refetchSchedules();
      
      toast.success('Shift updated successfully');
    } catch (error) {
      console.error('Error updating shift:', error);
      toast.error('Failed to update shift');
    } finally {
      setIsLoading(false);
    }
  };

  // Enhanced removeShift that deletes from database
  const removeShift = async (shiftId: string) => {
    try {
      setIsLoading(true);
      
      // Delete from database
      const { error } = await supabase
        .from('schedules')
        .delete()
        .eq('id', shiftId);

      if (error) {
        console.error('Error deleting shift:', error);
        throw error;
      }

      // Remove from local state
      shiftManagement.removeShift(shiftId);
      
      // Refresh schedules from database
      await refetchSchedules();
      
      toast.success('Shift deleted successfully');
    } catch (error) {
      console.error('Error deleting shift:', error);
      toast.error('Failed to delete shift');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh data every 30 seconds to ensure consistency
  useEffect(() => {
    const interval = setInterval(() => {
      if (!schedulesLoading && !employeesLoading) {
        refetchSchedules();
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [schedulesLoading, employeesLoading, refetchSchedules]);

  return {
    // Data
    employees,
    shifts,
    openShifts: shiftManagement.openShifts,
    
    // Loading states
    isLoading: schedulesLoading || employeesLoading || isLoading,
    
    // Week navigation
    currentWeek,
    weekStats,
    previousWeek,
    nextWeek,
    
    // Shift management
    addShift,
    updateShift,
    removeShift: removeShift,
    addOpenShift: shiftManagement.addOpenShift,
    assignOpenShift: shiftManagement.assignOpenShift,
    
    // View management
    viewMode,
    setViewMode,
    
    // Refresh function
    refreshData: refetchSchedules
  };
};
