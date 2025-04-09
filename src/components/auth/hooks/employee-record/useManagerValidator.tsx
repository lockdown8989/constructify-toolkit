
import { supabase } from "@/integrations/supabase/client";

export const useManagerValidator = () => {
  const validateManagerId = async (managerId: string) => {
    console.log(`Verifying manager ID: ${managerId}`);
    
    if (!managerId || !managerId.startsWith('MGR-')) {
      console.log(`Invalid manager ID format: ${managerId}`);
      return null;
    }
    
    try {
      // First try to find the manager by querying for records where manager_id equals the provided ID
      const { data: managerData, error: managerError } = await supabase
        .from('employees')
        .select('id, user_id, name, manager_id, job_title')
        .eq('manager_id', managerId)
        .maybeSingle();
        
      if (managerError && managerError.code !== 'PGRST116') {
        // This is a real error, not just "no results"
        console.error("Error validating manager ID:", managerError);
        return null;
      }
      
      if (managerData) {
        console.log(`Found valid manager with ID: ${managerId}, name: ${managerData.name}`);
        return managerData;
      }
      
      // If no results from the first query, try another approach
      // Look for any employee with this manager_id (could be the manager themselves)
      const { data: employeeWithManagerId, error: empError } = await supabase
        .from('employees')
        .select('id, user_id, name, manager_id, job_title')
        .eq('manager_id', managerId)
        .maybeSingle();
        
      if (empError && empError.code !== 'PGRST116') {
        console.error("Error in secondary manager ID validation:", empError);
        return null;
      }
      
      if (employeeWithManagerId) {
        console.log(`Found employee with manager ID: ${managerId}`);
        return employeeWithManagerId;
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
