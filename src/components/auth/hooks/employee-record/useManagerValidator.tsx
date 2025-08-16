
import { supabase } from "@/integrations/supabase/client";

export const useManagerValidator = () => {
  const validateManagerId = async (managerId: string) => {
    console.log(`Verifying manager ID: ${managerId}`);
    
    if (!managerId || !managerId.startsWith('MGR-')) {
      console.log(`Invalid manager ID format: ${managerId}`);
      return null;
    }
    
    try {
      // Use the strict validation function to ensure proper manager isolation
      const { data: validationResult, error } = await supabase.rpc('validate_manager_id_strict', {
        p_manager_id: managerId
      });
      
      if (error) {
        console.error("Error validating manager ID:", error);
        return null;
      }
      
      if (validationResult?.valid) {
        console.log(`Valid manager ID ${managerId}: ${validationResult.manager_name}`);
        return {
          id: managerId, // Return the manager ID as identifier
          user_id: validationResult.manager_user_id,
          name: validationResult.manager_name,
          manager_id: managerId,
          job_title: validationResult.manager_role || 'Manager'
        };
      } else {
        console.log(`Manager ID validation failed: ${validationResult?.error}`);
        return null;
      }
    } catch (error) {
      console.error("Manager validation error:", error);
      return null;
    }
  };

  return { validateManagerId };
};
