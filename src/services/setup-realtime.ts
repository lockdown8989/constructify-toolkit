
import { supabase } from '@/integrations/supabase/client';

export const setupRealtimeSubscriptions = async () => {
  try {
    // Set up replica identity for tables to enable real-time updates
    try {
      const { error: replicaError } = await supabase.rpc('alter_table_replica_identity', {
        identity_type: 'FULL',
        table_name: 'schedules'
      });
      
      if (replicaError) {
        console.error('Error setting REPLICA IDENTITY:', replicaError);
      }
    } catch (err) {
      console.error('Error setting REPLICA IDENTITY:', err);
    }
    
    // Add tables to realtime publication
    try {
      const { error: publicationError } = await supabase.rpc('add_table_to_publication', {
        publication_name: 'supabase_realtime',
        table_name: 'schedules'
      });
      
      if (publicationError) {
        console.error('Error adding table to publication:', publicationError);
      }
    } catch (err) {
      console.error('Error adding table to publication:', err);
    }
    
    console.log('Realtime subscriptions set up successfully');
    return true;
  } catch (error) {
    console.error('Error setting up realtime subscriptions:', error);
    return false;
  }
};
