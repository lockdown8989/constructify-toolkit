
import { supabase } from '@/integrations/supabase/client';

/**
 * Retrieves user IDs of all users with manager role
 * Uses direct query approach to avoid RLS recursion issues
 */
export const getManagerUserIds = async (): Promise<string[]> => {
  try {
    // Query user_roles table for users with management roles
    // Using the correct enum values that match the database
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'employer');
    
    if (error) {
      console.error('Error fetching manager user IDs:', error);
      return [];
    }
    
    return data.map(item => item.user_id);
  } catch (error) {
    console.error('Exception in getManagerUserIds:', error);
    return [];
  }
};

/**
 * Checks if a user has a manager role
 * Uses direct query approach to avoid RLS recursion issues
 */
export const userHasManagerRole = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'employer')
      .maybeSingle();
    
    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Exception in userHasManagerRole:', error);
    return false;
  }
};
