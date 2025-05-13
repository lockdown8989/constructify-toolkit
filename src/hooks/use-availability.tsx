
// This file serves as a compatibility layer for older code
// It re-exports everything from the refactored modules

import { 
  useAvailabilityRequests
} from './availability/use-fetch-availability';
import { useUpdateAvailabilityRequest } from './availability/use-update-availability';
import { useDeleteAvailabilityRequest } from './availability/use-delete-availability';
import { useCreateAvailabilityRequest } from './availability/use-create-availability';
import { AvailabilityRequest } from '@/types/availability';

// Create a unified hook that combines all availability functionality
export function useAvailability() {
  const { 
    data: availabilityRequests = [],
    isLoading, 
    error
  } = useAvailabilityRequests();
  
  const { mutate: updateRequest } = useUpdateAvailabilityRequest();
  const { mutate: deleteRequest } = useDeleteAvailabilityRequest();
  
  const approveAvailabilityRequest = (id: string, managerNotes?: string) => {
    updateRequest({
      id,
      status: 'Approved',
      manager_notes: managerNotes || null
    });
  };
  
  const rejectAvailabilityRequest = (id: string, managerNotes?: string) => {
    updateRequest({
      id,
      status: 'Rejected',
      manager_notes: managerNotes || null
    });
  };
  
  return {
    availabilityRequests,
    isLoading,
    error,
    updateAvailabilityRequest: updateRequest,
    deleteAvailabilityRequest: deleteRequest,
    approveAvailabilityRequest,
    rejectAvailabilityRequest
  };
}

// Re-export everything from the refactored modules for direct access
export * from './availability';
