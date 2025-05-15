
import { useState } from 'react';
import { useCreateAvailability } from './use-create-availability';
import { useGetAvailability } from './use-fetch-availability';
import { useDeleteAvailability } from './use-delete-availability';
import { useUpdateAvailability } from './use-update-availability';
import { supabase } from '@/integrations/supabase/client';

export const useAvailability = () => {
  const { data, isLoading, error, refetch } = useGetAvailability();
  const createMutation = useCreateAvailability();
  const updateMutation = useUpdateAvailability();
  const deleteMutation = useDeleteAvailability();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Helper to format date for the backend
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Toggle availability for a specific time slot
  const toggleAvailability = async (date: Date, startTime: string, endTime: string, isAvailable: boolean) => {
    const formattedDate = formatDate(date);
    
    // Get current user's employee ID
    const { data: userData } = await supabase.auth.getUser();
    const { data: employeeData } = await supabase
      .from('employees')
      .select('id')
      .eq('user_id', userData.user?.id)
      .maybeSingle();
      
    const employeeId = employeeData?.id;
    if (!employeeId) {
      console.error('No employee ID found');
      return;
    }
    
    // Check if there's an existing entry
    const existingEntry = data?.find(
      entry => entry.date === formattedDate && 
      entry.start_time === startTime && 
      entry.end_time === endTime
    );

    if (existingEntry) {
      // Update existing entry
      await updateMutation.mutate({
        id: existingEntry.id,
        is_available: isAvailable,
      });
    } else {
      // Create new entry
      await createMutation.mutate({
        employee_id: employeeId,
        date: formattedDate,
        start_time: startTime,
        end_time: endTime,
        is_available: isAvailable,
      });
    }

    // Refresh data
    refetch();
  };

  return {
    availabilityData: data || [],
    isLoading,
    error,
    refetch,
    toggleAvailability,
    createAvailability: createMutation.mutate,
    updateAvailability: updateMutation.mutate,
    deleteAvailability: deleteMutation.deleteAvailability,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isUpdating,
    isDeleting: deleteMutation.isDeleting,
    selectedDay,
    setSelectedDay,
    selectedTimeSlot,
    setSelectedTimeSlot,
  };
};

export * from './use-create-availability';
export * from './use-fetch-availability';
export * from './use-update-availability';
export * from './use-delete-availability';
