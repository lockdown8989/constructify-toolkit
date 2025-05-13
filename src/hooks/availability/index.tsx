
// Re-export all availability hooks
export * from './use-fetch-availability';
export * from './use-create-availability';
export * from './use-update-availability';
export * from './use-delete-availability';

// Add the useAvailability hook
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { AvailabilityRequest } from '@/types/availability';
import { useUpdateAvailabilityRequest } from './use-update-availability';

export const useAvailability = () => {
  // Fetch all availability requests
  const { 
    data: availabilityRequests, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: ['availability-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('availability_requests')
        .select(`
          *,
          employees(name, department)
        `)
        .order('date', { ascending: true });
        
      if (error) throw error;
      return data as AvailabilityRequest[];
    }
  });
  
  // Use the update mutation hook
  const { mutate: updateMutation } = useUpdateAvailabilityRequest();
  
  // Approval function
  const approveAvailabilityRequest = (requestId: string) => {
    updateMutation({
      id: requestId,
      status: 'Approved',
      reviewer_id: undefined
    });
  };
  
  // Reject function
  const rejectAvailabilityRequest = (requestId: string) => {
    updateMutation({
      id: requestId,
      status: 'Rejected',
      reviewer_id: undefined
    });
  };
  
  return {
    availabilityRequests: availabilityRequests || [],
    isLoading,
    error,
    approveAvailabilityRequest,
    rejectAvailabilityRequest
  };
};
