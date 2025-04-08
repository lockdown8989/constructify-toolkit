
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

export const useManagerValidator = () => {
  const [isValidating, setIsValidating] = useState(false);
  
  const validateManagerId = async (managerId: string) => {
    console.log(`Verifying manager ID: ${managerId}`);
    setIsValidating(true);
    
    try {
      // Basic format validation first
      if (!managerId || !managerId.startsWith('MGR-')) {
        console.error(`Manager ID ${managerId} has invalid format`);
        return null;
      }
      
      // Verify the manager ID exists in the employees table
      const { data: managerExists, error } = await supabase
        .from('employees')
        .select('id, user_id, name, manager_id')
        .eq('manager_id', managerId.trim())
        .eq('job_title', 'Manager')
        .maybeSingle();
        
      if (error) {
        console.error("Error validating manager ID:", error);
        return null;
      }
        
      if (managerExists) {
        console.log(`Found valid manager with ID: ${managerId}, name: ${managerExists.name}`);
        return managerExists;
      }
      
      // Double-check user_roles table as fallback
      const { data: managerRoleExists, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'employer')
        .limit(1);
        
      if (roleError) {
        console.error("Error checking manager roles:", roleError);
      } else if (managerRoleExists && managerRoleExists.length > 0) {
        console.log("Found manager role, but no matching manager ID in employees table");
      }
      
      console.log(`Manager ID ${managerId} not found or not assigned to a manager`);
      return null;
    } catch (error) {
      console.error("Manager validation error:", error);
      return null;
    } finally {
      setIsValidating(false);
    }
  };

  return { validateManagerId, isValidating };
};
