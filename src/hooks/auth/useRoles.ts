
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

export const useRoles = (user: User | null) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHR, setIsHR] = useState(false);
  const [isManager, setIsManager] = useState(false);

  // Use a callback to prevent dependency issues
  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      console.log("Fetching roles for user:", userId);
      
      // Direct query to get user roles - skip the RPC call that's causing issues
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error fetching roles:", error);
        return;
      }
      
      // Process roles data
      const roles = data || [];
      const roleValues = roles.map(r => r.role);
      
      console.log("Roles found:", roleValues);
      
      setIsAdmin(roleValues.includes('admin'));
      setIsHR(roleValues.includes('hr'));
      setIsManager(roleValues.includes('employer'));

      // If no manager role found but user exists, check employee record
      if (!roleValues.includes('employer') && userId) {
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
  }, []);

  const resetRoles = useCallback(() => {
    setIsAdmin(false);
    setIsHR(false);
    setIsManager(false);
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchUserRoles(user.id);
    } else {
      resetRoles();
    }
  }, [user?.id, fetchUserRoles, resetRoles]);

  return {
    isAdmin,
    isHR,
    isManager,
    fetchUserRoles,
    resetRoles
  };
};
