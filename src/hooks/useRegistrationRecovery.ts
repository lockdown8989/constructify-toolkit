import { useEffect, useState } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

/**
 * Hook to handle incomplete registration recovery
 * Attempts to complete user registration if employee record is missing
 */
export const useRegistrationRecovery = () => {
  const { user, rolesLoaded } = useAuth();
  const { toast } = useToast();
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    const checkAndRecoverRegistration = async () => {
      if (!user || !rolesLoaded || isRecovering) return;

      try {
        // Check if user has employee record
        const { data: employee, error: empError } = await supabase
          .from('employees')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (empError && empError.code !== 'PGRST116') {
          console.error('Error checking employee record:', empError);
          return;
        }

        // Check if user has roles
        const { data: roles, error: roleError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (roleError) {
          console.error('Error checking user roles:', roleError);
          return;
        }

        // If no employee record but has roles, attempt recovery
        if (!employee && roles && roles.length > 0) {
          console.log('🔄 Attempting registration recovery for user with roles but no employee record');
          setIsRecovering(true);

          const primaryRole = roles[0].role;
          const firstName = user.user_metadata?.first_name || user.email?.split('@')[0] || 'User';
          const lastName = user.user_metadata?.last_name || '';

          // Attempt to complete registration
          const { data: result, error: recoveryError } = await supabase.rpc('complete_user_registration', {
            p_user_id: user.id,
            p_email: user.email,
            p_first_name: firstName,
            p_last_name: lastName,
            p_user_role: primaryRole,
            p_manager_id: null
          });

          if (recoveryError) {
            console.error('Registration recovery failed:', recoveryError);
            toast({
              title: "Account Setup Incomplete",
              description: "There was an issue setting up your profile. Please contact support if this persists.",
              variant: "default",
            });
          } else if (result?.success) {
            console.log('✅ Registration recovery successful');
            toast({
              title: "Account Setup Completed",
              description: "Your profile has been successfully set up.",
            });
            // Force a page refresh to reload the dashboard
            setTimeout(() => {
              window.location.reload();
            }, 2000);
          }
        }
      } catch (error) {
        console.error('Error during registration recovery:', error);
      } finally {
        setIsRecovering(false);
      }
    };

    // Run recovery check with reduced delay to speed up dashboard loading
    const timer = setTimeout(checkAndRecoverRegistration, 500);
    return () => clearTimeout(timer);
  }, [user, rolesLoaded, isRecovering, toast]);

  return { isRecovering };
};