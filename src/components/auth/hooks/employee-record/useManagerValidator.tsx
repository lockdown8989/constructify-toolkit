
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
      
      console.log(`Manager ID ${managerId} not found`);
      return null;
    } catch (error) {
      console.error("Manager validation error:", error);
      return null;
    }
  };

  return { validateManagerId };
};
