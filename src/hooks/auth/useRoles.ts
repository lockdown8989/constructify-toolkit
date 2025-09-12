
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
        
        // Retry logic for role fetching to handle new user registrations
        let roles = null;
        let attempts = 0;
        const maxAttempts = 5;
        
        while (!roles && attempts < maxAttempts) {
          attempts++;
          console.log(`🔄 Role fetch attempt ${attempts}/${maxAttempts}`);
          
          const { data, error } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

          if (error && attempts === maxAttempts) {
            console.error('❌ Error fetching user roles:', error);
            throw error;
          } else if (error) {
            console.warn(`⚠️ Role fetch attempt ${attempts} failed, retrying...`, error);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1s before retry
            continue;
          }

          roles = data;
          if (!roles || roles.length === 0) {
            // For new registrations, roles might not be immediately available
            console.log(`🔄 No roles found on attempt ${attempts}, ${attempts < maxAttempts ? 'retrying' : 'continuing with defaults'}...`);
            if (attempts < maxAttempts) {
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }
        }

        console.log('✅ User roles fetched:', roles);

        // Derive role flags; fallback to employees table if user_roles missing
        let userRoles = roles?.map(r => r.role) || [];

        if (!userRoles.length) {
          console.log('ℹ️ No roles in user_roles; falling back to employees.role');
          const { data: emp, error: empError } = await supabase
            .from('employees')
            .select('role')
            .eq('user_id', user.id)
            .maybeSingle();
          if (empError) {
            console.warn('⚠️ Employees role fallback error:', empError);
          }
          if (emp?.role) {
            userRoles = [emp.role as string];
          }
        }

        // Map database roles to UI roles
        const isAdminRole = userRoles.includes('admin');
        const isHRRole = userRoles.includes('hr');
        const isManagerRole = userRoles.includes('manager') || userRoles.includes('employer'); // Map 'employer' to manager
        const isPayrollRole = userRoles.includes('payroll');
        
        setIsAdmin(isAdminRole);
        setIsHR(isHRRole);
        setIsManager(isManagerRole);
        setIsPayroll(isPayrollRole);
        setRolesLoaded(true);
        
        console.log('🎯 Roles set:', {
          userRoles,
          isAdmin: isAdminRole,
          isHR: isHRRole,
          isManager: isManagerRole,
          isPayroll: isPayrollRole,
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
