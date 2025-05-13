
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
      
      // Query directly for specific roles rather than getting all roles first
      const { data: adminRole, error: adminError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      const { data: hrRole, error: hrError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'hr')
        .maybeSingle();
      
      const { data: managerRole, error: managerError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'employer')
        .maybeSingle();
      
      if (adminError || hrError || managerError) {
        console.error('Error fetching user roles:', { adminError, hrError, managerError });
        return;
      }
      
      // Update role states based on query results
      setIsAdmin(!!adminRole);
      setIsHR(!!hrRole);
      setIsManager(!!managerRole);
      
      console.log("Roles found:", {
        admin: !!adminRole,
        hr: !!hrRole,
        manager: !!managerRole
      });

      // If no manager role but has manager_id that starts with MGR-, they're a manager
      if (!managerRole && userId) {
        const { data: empData } = await supabase
          .from('employees')
          .select('manager_id')
          .eq('user_id', userId)
          .maybeSingle();
        
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
