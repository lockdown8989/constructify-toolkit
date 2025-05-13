
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
      
      // Use direct SQL query via RPC instead of table access to avoid RLS recursion
      const { data: roles, error } = await supabase.rpc('get_user_roles', {
        p_user_id: userId
      });
      
      if (error) {
        console.error("Error fetching roles via RPC:", error);
        
        // Fallback to direct queries with bypassed RLS
        const [{ data: adminRole }, { data: hrRole }, { data: managerRole }] = await Promise.all([
          // Query for admin role with bypass RLS
          supabase.from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'admin')
            .limit(1),
            
          // Query for HR role with bypass RLS
          supabase.from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'hr')
            .limit(1),
            
          // Query for manager/employer role with bypass RLS
          supabase.from('user_roles')
            .select('role')
            .eq('user_id', userId)
            .eq('role', 'employer')
            .limit(1)
        ]);
        
        // Update role states based on direct query results
        setIsAdmin(!!adminRole && adminRole.length > 0);
        setIsHR(!!hrRole && hrRole.length > 0);
        setIsManager(!!managerRole && managerRole.length > 0);
      } else if (roles) {
        // Process roles from RPC function
        const roleArray = roles || [];
        setIsAdmin(roleArray.includes('admin'));
        setIsHR(roleArray.includes('hr'));
        setIsManager(roleArray.includes('employer'));
      }
      
      console.log("Roles found:", {
        admin: isAdmin,
        hr: isHR,
        manager: isManager
      });

      // If no manager role found but user exists, check employee record
      if (!isManager && userId) {
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

  useEffect(() => {
    if (user?.id) {
      fetchUserRoles(user.id);
    } else {
      resetRoles();
    }
  }, [user?.id]); // Only depend on user.id to prevent infinite loops

  return {
    isAdmin,
    isHR,
    isManager,
    fetchUserRoles,
    resetRoles
  };
};
