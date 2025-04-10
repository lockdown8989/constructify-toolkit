
import { supabase } from '@/integrations/supabase/client';

/**
 * Gets all manager user IDs from the database
 */
export const getManagerUserIds = async (): Promise<string[]> => {
  console.log('NotificationService: Getting manager user IDs');
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'employer');
      
    if (error) {
      console.error('Error getting manager user IDs:', error);
      throw error;
    }
    
    // Also get admin and HR user IDs
    const { data: adminData, error: adminError } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'hr']);
      
    if (adminError) {
      console.error('Error getting admin/HR user IDs:', adminError);
      throw adminError;
    }
    
    // Combine all manager user IDs
    const managerIds = [...(data || []), ...(adminData || [])].map(item => item.user_id);
    console.log('NotificationService: Found manager user IDs:', managerIds);
    
    return managerIds;
  } catch (error) {
    console.error('Exception getting manager user IDs:', error);
    return [];
  }
};
