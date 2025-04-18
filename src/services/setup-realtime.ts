
import { supabase } from '@/integrations/supabase/client';

export const setupRealtimeSubscriptions = async () => {
  try {
    // Enable REPLICA IDENTITY FULL on schedules table for complete change data capture
    const { error: replicaError } = await supabase.rpc('alter_table_replica_identity', {
      table_name: 'schedules',
      identity_type: 'FULL'
    });
    
    if (replicaError) {
      console.error('Error setting REPLICA IDENTITY:', replicaError);
    }
    
    // Add schedules table to the supabase_realtime publication
    const { error: publicationError } = await supabase.rpc('add_table_to_publication', {
      table_name: 'schedules',
      publication_name: 'supabase_realtime'
    });
    
    if (publicationError) {
      console.error('Error adding table to publication:', publicationError);
    }
    
    console.log('Realtime subscriptions set up successfully');
  } catch (error) {
    console.error('Error setting up realtime subscriptions:', error);
  }
};
