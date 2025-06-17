
import { useState } from 'react';
import { Shift } from '@/types/restaurant-schedule';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useDatabaseOperations = (refetchSchedules: () => Promise<any>) => {
  const [isLoading, setIsLoading] = useState(false);

  const calculateShiftDateTime = (newShift: Omit<Shift, 'id'>) => {
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

    return { startDateTime, endDateTime };
  };

  const addShift = async (newShift: Omit<Shift, 'id'>) => {
    try {
      setIsLoading(true);
      
      const { startDateTime, endDateTime } = calculateShiftDateTime(newShift);

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

  const updateShift = async (updatedShift: Shift, schedulesData: any[]) => {
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

  return {
    addShift,
    updateShift,
    removeShift,
    isLoading
  };
};
