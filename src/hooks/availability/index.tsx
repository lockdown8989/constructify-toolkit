
import { useState } from 'react';
import { useCreateAvailability } from './use-create-availability';
import { useGetAvailability } from './use-fetch-availability';
import { useDeleteAvailability } from './use-delete-availability';
import { useUpdateAvailability } from './use-update-availability';

export const useAvailability = () => {
  const { data, isLoading, error, refetch } = useGetAvailability();
  const { mutate: createAvailability, isPending: isCreating } = useCreateAvailability();
  const { mutate: updateAvailability, isPending: isUpdating } = useUpdateAvailability();
  const { mutate: deleteAvailability, isPending: isDeleting } = useDeleteAvailability();

  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Helper to format date for the backend
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // Toggle availability for a specific time slot
  const toggleAvailability = async (date: Date, startTime: string, endTime: string, isAvailable: boolean) => {
    const formattedDate = formatDate(date);
    
    // Check if there's an existing entry
    const existingEntry = data?.find(
      entry => entry.date === formattedDate && 
      entry.start_time === startTime && 
      entry.end_time === endTime
    );

    if (existingEntry) {
      // Update existing entry
      await updateAvailability({
        id: existingEntry.id,
        is_available: isAvailable,
      });
    } else {
      // Create new entry
      await createAvailability({
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
    createAvailability,
    updateAvailability,
    deleteAvailability,
    isCreating,
    isUpdating,
    isDeleting,
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
