
// Export all availability-related hooks
export * from './use-fetch-availability';
export * from './use-create-availability';
export * from './use-update-availability';
export * from './use-delete-availability';

// Initialize real-time updates
import { supabase } from '@/integrations/supabase/client';

// This self-executing function sets up real-time for availability_requests
(async function setupRealTimeForAvailabilityRequests() {
  try {
    // Create a channel for availability_requests changes
    const channel = supabase
      .channel('availability-realtime')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'availability_requests'
        },
        (payload) => {
          console.log('Real-time update received for availability_requests:', payload);
        }
      )
      .subscribe(status => {
        console.log('Availability requests subscription status:', status);
      });
    
    console.log('Real-time subscription for availability_requests set up successfully');
  } catch (error) {
    console.error('Failed to initialize real-time for availability_requests:', error);
  }
})();
