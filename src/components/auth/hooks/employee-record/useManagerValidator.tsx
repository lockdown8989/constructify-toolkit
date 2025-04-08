
import { supabase } from "@/integrations/supabase/client";

export const useManagerValidator = () => {
  const validateManagerId = async (managerId: string) => {
    console.log(`Verifying manager ID: ${managerId}`);
    
    if (!managerId || !managerId.startsWith('MGR-')) {
      console.log(`Invalid manager ID format: ${managerId}`);
      return null;
    }
    
    try {
      // Verify the manager ID exists in employees table
      const { data: managerData, error: managerError } = await supabase
        .from('employees')
        .select('id, user_id, name, manager_id')
        .eq('manager_id', managerId)
        .maybeSingle();
        
      if (managerError) {
        console.error("Error validating manager ID:", managerError);
        return null;
      }
        
      if (managerData) {
        console.log(`Found valid manager with ID: ${managerId}, name: ${managerData.name}`);
        return managerData;
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
