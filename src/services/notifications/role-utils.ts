
import { supabase } from '@/integrations/supabase/client';

/**
 * Gets all user IDs with manager role
 */
export const getManagerUserIds = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'employer');
    
    if (error) {
      console.error('Error fetching manager user IDs:', error);
      throw error;
    }
    
    return data.map(item => item.user_id);
  } catch (error) {
    console.error('Exception in getManagerUserIds:', error);
    return [];
  }
};

/**
 * Gets all user IDs with admin role
 */
export const getAdminUserIds = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'admin');
    
    if (error) {
      console.error('Error fetching admin user IDs:', error);
      throw error;
    }
    
    return data.map(item => item.user_id);
  } catch (error) {
    console.error('Exception in getAdminUserIds:', error);
    return [];
  }
};

/**
 * Gets all user IDs with HR role
 */
export const getHRUserIds = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .eq('role', 'hr');
    
    if (error) {
      console.error('Error fetching HR user IDs:', error);
      throw error;
    }
    
    return data.map(item => item.user_id);
  } catch (error) {
    console.error('Exception in getHRUserIds:', error);
    return [];
  }
};
