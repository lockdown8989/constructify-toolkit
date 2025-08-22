
import { useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSecurityValidation } from './useSecurityValidation';
import { supabase } from '@/integrations/supabase/client';

export const useSecureOperations = () => {
  const { user } = useAuth();
  const { checkRateLimit } = useSecurityValidation();

  // Secure user deletion with additional validation
  const secureDeleteAccount = useCallback(async () => {
    if (!user) {
      console.error('No authenticated user for deletion');
      throw new Error('No authenticated user');
    }

    // Rate limit account deletion attempts
    if (!checkRateLimit(`delete_account_${user.id}`, 3, 3600000)) {
      throw new Error('Too many deletion attempts. Please try again later.');
    }

    try {
      console.log('🔥 Calling delete-user-account function...');
      
      const { data, error } = await supabase.functions.invoke('delete-user-account', {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });
      
      if (error) {
        console.error('Account deletion error:', error);
        throw new Error(`Failed to delete account: ${error.message}`);
      }

      console.log('✅ Account deletion completed:', data);
      return { success: true, data };
    } catch (error) {
      console.error('Secure account deletion failed:', error);
      throw error;
    }
  }, [user, checkRateLimit]);

  // Secure role assignment with validation
  const secureRoleAssignment = useCallback(async (userId: string, role: string) => {
    if (!user) {
      throw new Error('Authentication required');
    }

    // Rate limit role assignment operations
    if (!checkRateLimit(`role_assignment_${user.id}`, 10, 3600000)) {
      throw new Error('Too many role assignment attempts. Please try again later.');
    }

    // Validate role
    const validRoles = ['admin', 'hr', 'employer', 'employee', 'payroll'];
    if (!validRoles.includes(role)) {
      throw new Error('Invalid role specified');
    }

    // Additional security: Check if current user has permission to assign roles
    const { data: currentUserRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id);

    const isAdmin = currentUserRoles?.some(r => r.role === 'admin');
    if (!isAdmin) {
      throw new Error('Insufficient permissions to assign roles');
    }

    return { success: true, role };
  }, [user, checkRateLimit]);

  return {
    secureDeleteAccount,
    secureRoleAssignment
  };
};
