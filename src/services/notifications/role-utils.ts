
import { supabase } from '@/integrations/supabase/client';

/**
 * Retrieves user IDs of all users with manager role
 */
export const getManagerUserIds = async (): Promise<string[]> => {
  try {
    // Query user_roles table for users with management roles
    // Using the correct enum values that match the database
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['employer', 'admin', 'hr']);
    
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
 */
export const userHasManagerRole = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['employer', 'admin', 'hr'])
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

/**
 * Get recipient user IDs by role
 */
export const getRecipientsByRole = async (roles: string[]): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', roles);
      
    if (error) {
      console.error('Error fetching recipients by role:', error);
      return [];
    }
    
    return data.map(item => item.user_id);
  } catch (error) {
    console.error('Exception in getRecipientsByRole:', error);
    return [];
  }
};
