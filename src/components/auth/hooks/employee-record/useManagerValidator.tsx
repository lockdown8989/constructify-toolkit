
import { supabase } from "@/integrations/supabase/client";

export const useManagerValidator = () => {
  const validateManagerId = async (managerId: string) => {
    console.log(`Verifying manager ID: ${managerId}`);
    
    if (!managerId || !managerId.startsWith('MGR-')) {
      console.log(`Invalid manager ID format: ${managerId}`);
      return null;
    }
    
    try {
      // Use the updated strict validation function
      const { data: validationResult, error } = await supabase.rpc('validate_manager_id_strict', {
        p_manager_id: managerId
      });
      
      if (error) {
        console.error("Error validating manager ID:", error);
        return null;
      }
      
      // Handle the array response from the function
      const result = validationResult && validationResult.length > 0 ? validationResult[0] : null;
      
      if (result?.valid) {
        console.log(`Valid manager ID ${managerId}: ${result.manager_name}`);
        return {
          id: managerId,
          user_id: result.manager_user_id,
          name: result.manager_name,
          manager_id: managerId,
          job_title: result.manager_role || 'Manager'
        };
      } else {
        console.log(`Manager ID validation failed: ${result?.error || 'Unknown error'}`);
        return null;
      }
    } catch (error) {
      console.error("Manager validation error:", error);
      return null;
    }
  };

  return { validateManagerId };
};
