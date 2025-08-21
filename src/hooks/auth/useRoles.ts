
import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

export const useRoles = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHR, setIsHR] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isPayroll, setIsPayroll] = useState(false);
  const [rolesLoaded, setRolesLoaded] = useState(false);

  useEffect(() => {
    const fetchRoles = async () => {
      if (!user?.id) {
        console.log('🔄 No user ID, clearing roles');
        setIsAdmin(false);
        setIsHR(false);
        setIsManager(false);
        setIsPayroll(false);
        setRolesLoaded(true);
        return;
      }

      try {
        console.log('🔄 Fetching roles for user:', user.id);
        
        const { data: roles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('❌ Error fetching user roles:', error);
          throw error;
        }

        console.log('✅ User roles fetched:', roles);

        const userRoles = roles?.map(r => r.role) || [];
        
        setIsAdmin(userRoles.includes('admin'));
        setIsHR(userRoles.includes('hr'));
        setIsManager(userRoles.includes('employer') || userRoles.includes('manager'));
        setIsPayroll(userRoles.includes('payroll'));
        setRolesLoaded(true);

        console.log('🎯 Roles set:', {
          isAdmin: userRoles.includes('admin'),
          isHR: userRoles.includes('hr'),
          isManager: userRoles.includes('employer') || userRoles.includes('manager'),
          isPayroll: userRoles.includes('payroll'),
          userEmail: user.email
        });

      } catch (error) {
        console.error('💥 Exception in fetchRoles:', error);
        // Set default values on error but still mark as loaded
        setIsAdmin(false);
        setIsHR(false);
        setIsManager(false);
        setIsPayroll(false);
        setRolesLoaded(true);
      }
    };

    fetchRoles();
  }, [user?.id]);

  return { isAdmin, isHR, isManager, isPayroll, rolesLoaded };
};
