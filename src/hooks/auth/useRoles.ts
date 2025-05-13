
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useRoles = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHR, setIsHR] = useState(false);
  const [isManager, setIsManager] = useState(false);

  const fetchUserRoles = async (userId: string) => {
    try {
      console.log("Fetching roles for user:", userId);
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }

      if (roles && roles.length > 0) {
        const userRoles = roles.map(r => r.role);
        console.log("User roles found:", userRoles);
        
        // Check each role
        setIsAdmin(userRoles.includes('admin'));
        setIsHR(userRoles.includes('hr'));
        
        // Check for 'employer' role which corresponds to manager in the UI
        const hasEmployerRole = userRoles.includes('employer');
        console.log("Has employer/manager role:", hasEmployerRole);
        setIsManager(hasEmployerRole);
      } else {
        console.log("No roles found for user");
        setIsAdmin(false);
        setIsHR(false);
        setIsManager(false);
        
        // Fetch employee record to check if user has a manager_id
        if (userId) {
          const { data: empData } = await supabase
            .from('employees')
            .select('manager_id')
            .eq('user_id', userId)
            .maybeSingle();
          
          // If the employee record has a manager_id that starts with MGR-, they're a manager
          if (empData?.manager_id && empData.manager_id.startsWith('MGR-')) {
            console.log("User has a manager_id, setting isManager=true:", empData.manager_id);
            setIsManager(true);
            
            // Add the employer role to ensure consistency
            const { error: addRoleError } = await supabase
              .from('user_roles')
              .insert({ user_id: userId, role: 'employer' });
              
            if (addRoleError) {
              console.error("Error adding employer role:", addRoleError);
            } else {
              console.log("Added employer role to user");
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
    }
  };

  return {
    isAdmin,
    isHR,
    isManager,
    fetchUserRoles,
    resetRoles: () => {
      setIsAdmin(false);
      setIsHR(false);
      setIsManager(false);
    }
  };
};
