
import { supabase } from '@/integrations/supabase/client';
import { mapDBRoleToUIRole, mapUIRoleToDBRole } from '@/hooks/auth/types';

/**
 * Gets all user IDs that have a manager role
 */
export const getManagerUserIds = async (): Promise<string[]> => {
  try {
    // Query for users with role 'employer' (manager) or 'admin' or 'hr'
    const { data, error } = await supabase
      .from('user_roles')
      .select('user_id')
      .in('role', ['employer', 'admin', 'hr']);
    
    if (error) {
      console.error("Error fetching manager IDs:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.warn('No manager users found in the system');
      return [];
    }
    
    return data.map(item => item.user_id);
  } catch (error) {
    console.error("Exception in getManagerUserIds:", error);
    return [];
  }
};

/**
 * Checks if a user has a specific role
 */
export const hasRole = async (userId: string, role: string): Promise<boolean> => {
  try {
    // Special handling for 'manager' role check - map to 'employer' in DB
    const dbRole = role === 'manager' ? 'employer' : role;
    
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', dbRole)
      .single();
    
    if (error) {
      // Don't throw on not found errors
      if (error.code === 'PGRST116') {
        return false;
      }
      console.error("Error checking role:", error);
      throw error;
    }
    
    return !!data;
  } catch (error) {
    console.error("Exception in hasRole:", error);
    return false;
  }
};

/**
 * Checks if a user has manager-level access (employer, admin, or hr)
 */
export const isManager = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .in('role', ['employer', 'admin', 'hr']);
    
    if (error) {
      console.error("Error checking manager status:", error);
      throw error;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error("Exception in isManager:", error);
    return false;
  }
};

/**
 * Gets all roles for a user
 */
export const getUserRoles = async (userId: string): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    
    if (error) {
      console.error("Error fetching user roles:", error);
      throw error;
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // Map database roles to UI roles (employer -> manager)
    return data.map(item => {
      const dbRole = item.role;
      return dbRole === 'employer' ? 'manager' : dbRole;
    });
  } catch (error) {
    console.error("Exception in getUserRoles:", error);
    return [];
  }
};
