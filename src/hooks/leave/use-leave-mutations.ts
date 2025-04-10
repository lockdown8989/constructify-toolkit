
// This file is kept for backward compatibility
// It re-exports all leave mutations from the new modular files
export * from './mutations';

// Enable the Supabase real-time functionality for the leave_calendar table
// This is done by running this code once when the app initializes
import { supabase } from '@/integrations/supabase/client';

// This function enables real-time for the leave_calendar table
// It's only executed once when this file is imported
(async function setupRealTimeForLeaveCalendar() {
  try {
    // Log that we're setting up the real-time channel
    console.log('Setting up real-time subscription for leave_calendar table');
    
    // Create a channel for leave_calendar changes
    const channel = supabase
      .channel('leave-calendar-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'leave_calendar'
        },
        (payload) => {
          console.log('Real-time update received for leave_calendar:', payload);
        }
      )
      .subscribe(status => {
        console.log('Leave calendar subscription status:', status);
      });
      
    console.log('Real-time subscription for leave_calendar table set up successfully');
    
    // We don't need to clean up the channel as it should last for the application lifetime
  } catch (error) {
    console.error('Failed to initialize real-time for leave_calendar:', error);
  }
})();
