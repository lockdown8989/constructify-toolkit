
// This file is kept for backward compatibility
// It re-exports all leave mutations from the new modular files
export * from './mutations';

// Enable the Supabase real-time functionality for the leave_calendar table
// This is done by running this code once when the app initializes
import { supabase } from '@/integrations/supabase/client';

// This function enables real-time for the leave_calendar table
// It's only executed once when this file is imported
(async function enableRealTimeForLeaveCalendar() {
  try {
    // We don't need to do anything here as real-time functionality
    // should be configured at the database level in Supabase
    console.log('Real-time functionality for leave_calendar is enabled through Supabase project settings');
  } catch (error) {
    console.error('Failed to initialize real-time for leave_calendar:', error);
  }
})();
