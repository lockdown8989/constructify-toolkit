
import { supabase } from "@/integrations/supabase/client";

export const useManagerValidator = () => {
  const validateManagerId = async (managerId: string) => {
    console.log(`Verifying manager ID: ${managerId}`);
    
    try {
      // Verify the manager ID exists
      const { data: managerExists, error } = await supabase
        .from('employees')
        .select('id, user_id, name')
        .eq('manager_id', managerId)
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
      
      // If no direct match found, check if ANY employee has this manager ID
      // This is needed because some managers might not have 'Manager' as job_title yet
      const { data: anyEmployeeWithManagerId, error: secondError } = await supabase
        .from('employees')
        .select('id, user_id, name')
        .eq('manager_id', managerId)
        .maybeSingle();
        
      if (secondError) {
        console.error("Error in secondary manager ID check:", secondError);
        return null;
      }
      
      if (anyEmployeeWithManagerId) {
        console.log(`Found employee with manager ID: ${managerId}, name: ${anyEmployeeWithManagerId.name}`);
        return anyEmployeeWithManagerId;
      }
      
      console.log(`Manager ID ${managerId} not found in database`);
      return null;
    } catch (error) {
      console.error("Manager validation error:", error);
      return null;
    }
  };

  return { validateManagerId };
};
