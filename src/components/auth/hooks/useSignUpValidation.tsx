
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
          
          // Make two separate queries to find managers
          // First check for employees with this manager_id who are managers
          const { data: managerData, error: managerError } = await supabase
            .from('employees')
            .select('id, name')
            .eq('manager_id', managerId)
            .eq('job_title', 'Manager')
            .maybeSingle();
            
          if (managerError) {
            console.error(`Error in primary manager check: ${managerError.message}`);
          }
          
          // If not found, check if any employee has this manager_id
          if (!managerData) {
            const { data: anyEmployee, error: anyError } = await supabase
              .from('employees')
              .select('id, name')
              .eq('manager_id', managerId)
              .maybeSingle();
              
            if (anyError) {
              console.error(`Error in secondary manager check: ${anyError.message}`);
            }
            
            if (anyEmployee) {
              console.log(`Found employee with manager ID: ${managerId}, name: ${anyEmployee.name}`);
              setIsManagerIdValid(true);
              setManagerName(anyEmployee.name);
              setIsValidatingManagerId(false);
              return;
            }
          } else {
            console.log(`Found manager with ID ${managerId}: ${managerData.name}`);
            setIsManagerIdValid(true);
            setManagerName(managerData.name);
            setIsValidatingManagerId(false);
            return;
          }
          
          console.log(`Manager ID ${managerId} is invalid - not found in database`);
          setIsManagerIdValid(false);
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
