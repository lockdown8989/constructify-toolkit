
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useRoles = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHR, setIsHR] = useState(false);
  const [isManager, setIsManager] = useState(false);

  // Fetch user roles directly with separate targeted queries to avoid recursion 
  const fetchUserRoles = async (userId: string) => {
    try {
      console.log("Fetching roles for user:", userId);
      
      // Use direct, separate queries to avoid recursion
      const [{ data: adminRole }, { data: hrRole }, { data: managerRole }] = await Promise.all([
        // Query for admin role
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'admin')
          .maybeSingle(),
          
        // Query for HR role
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'hr')
          .maybeSingle(),
          
        // Query for manager/employer role 
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .eq('role', 'employer')
          .maybeSingle()
      ]);
      
      // Update role states based on direct query results
      setIsAdmin(!!adminRole);
      setIsHR(!!hrRole);
      setIsManager(!!managerRole);
      
      console.log("Roles found:", {
        admin: !!adminRole,
        hr: !!hrRole,
        manager: !!managerRole
      });

      // If no manager role found but user exists, check employee record
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
        
        // If employee has a manager_id with MGR- prefix, they are a manager
        if (empData?.manager_id && empData.manager_id.startsWith('MGR-')) {
          console.log("User has a manager_id, setting isManager=true:", empData.manager_id);
          setIsManager(true);
          
          // Ensure consistency in the database by adding the employer role
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
