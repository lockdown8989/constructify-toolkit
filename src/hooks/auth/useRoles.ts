
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useRoles = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHR, setIsHR] = useState(false);
  const [isManager, setIsManager] = useState(false);

  // Fetch user roles directly - this way avoids the RLS recursion issue
  const fetchUserRoles = async (userId: string) => {
    try {
      console.log("Fetching roles for user:", userId);
      
      // Use direct queries without reusing the same query pattern
      const adminQuery = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'admin')
        .maybeSingle();
      
      const hrQuery = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'hr')
        .maybeSingle();
      
      const managerQuery = supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', 'employer')
        .maybeSingle();
      
      // Execute queries in parallel for better performance
      const [{ data: adminRole, error: adminError }, 
             { data: hrRole, error: hrError }, 
             { data: managerRole, error: managerError }] = await Promise.all([
        adminQuery, hrQuery, managerQuery
      ]);
      
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

      // If no manager role but we need to check manager_id
      if (!managerRole && userId) {
        const { data: empData, error: empError } = await supabase
          .from('employees')
          .select('manager_id')
          .eq('user_id', userId)
          .maybeSingle();
        
        if (empError) {
          console.error("Error checking employee manager_id:", empError);
          return;
        }
        
        if (empData?.manager_id && empData.manager_id.startsWith('MGR-')) {
          console.log("User has a manager_id, setting isManager=true:", empData.manager_id);
          setIsManager(true);
          
          // Add the employer role to ensure consistency - only if needed
          if (!managerRole) {
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

  const resetRoles = () => {
    setIsAdmin(false);
    setIsHR(false);
    setIsManager(false);
  };

  return {
    isAdmin,
    isHR,
    isManager,
    fetchUserRoles,
    resetRoles
  };
};
