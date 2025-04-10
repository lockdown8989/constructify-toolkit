
import { supabase } from '@/integrations/supabase/client';

/**
 * Gets all user IDs with manager roles (admin, employer, hr)
 */
export const getManagerUserIds = async (): Promise<string[]> => {
  try {
    console.log('Getting manager user IDs');
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['admin', 'employer', 'hr']);
    
    if (error) {
      console.error('Error fetching manager IDs:', error);
      throw error;
    }
    
    const managerIds = data.map(item => item.user_id);
    console.log(`Found ${managerIds.length} manager IDs:`, managerIds);
    
    return managerIds;
  } catch (error) {
    console.error('Error in getManagerUserIds:', error);
    return [];
  }
};

/**
 * Checks if a user has a manager role
 */
export const hasManagerRole = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['admin', 'employer', 'hr']);
    
    if (error) {
      console.error('Error checking manager role:', error);
      throw error;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Error in hasManagerRole:', error);
    return false;
  }
};
