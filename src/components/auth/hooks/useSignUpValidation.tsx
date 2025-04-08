
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useSignUpValidation = (userRole: string, managerId: string | null) => {
  const [isValidatingManagerId, setIsValidatingManagerId] = useState(false);
  const [isManagerIdValid, setIsManagerIdValid] = useState<boolean | undefined>(undefined);
  const [managerName, setManagerName] = useState<string | null>(null);

  // Validate the manager ID when it changes
  useEffect(() => {
    // Reset validation status when manager ID changes
    setIsManagerIdValid(undefined);
    setManagerName(null);
    
    // Only validate if this is an employee role with a manager ID
    if (userRole === 'employee' && managerId) {
      setIsValidatingManagerId(true);
      
      const validateManagerId = async () => {
        try {
          // First check basic format
          if (!managerId.startsWith('MGR-')) {
            console.log(`Manager ID ${managerId} has invalid format`);
            setIsManagerIdValid(false);
            setIsValidatingManagerId(false);
            return;
          }
          
          const { data, error } = await supabase
            .from('employees')
            .select('id, name')
            .eq('manager_id', managerId)
            .eq('job_title', 'Manager')
            .single();
            
          if (error || !data) {
            console.log(`Manager ID ${managerId} is invalid`);
            setIsManagerIdValid(false);
          } else {
            console.log(`Manager ID ${managerId} is valid, manager: ${data.name}`);
            setIsManagerIdValid(true);
            setManagerName(data.name);
          }
        } catch (error) {
          console.error("Error validating manager ID:", error);
          setIsManagerIdValid(false);
        } finally {
          setIsValidatingManagerId(false);
        }
      };
      
      // Use a small delay to avoid too many immediate validations while typing
      const timeoutId = setTimeout(validateManagerId, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [managerId, userRole]);

  return {
    isValidatingManagerId,
    isManagerIdValid,
    managerName
  };
};
