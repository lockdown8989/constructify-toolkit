
import { useState, useEffect } from "react";
import { useManagerValidator } from "./employee-record/useManagerValidator";

export const useSignUpValidation = (userRole: string, managerId: string | null) => {
  const [isValidatingManagerId, setIsValidatingManagerId] = useState(false);
  const [isManagerIdValid, setIsManagerIdValid] = useState<boolean | undefined>(undefined);
  const [managerName, setManagerName] = useState<string | null>(null);
  const { validateManagerId } = useManagerValidator();

  // Validate the manager ID when it changes
  useEffect(() => {
    // Reset validation status when manager ID changes
    setIsManagerIdValid(undefined);
    setManagerName(null);
    
    // Only validate if this is an employee role with a manager ID
    if (userRole === 'employee' && managerId) {
      setIsValidatingManagerId(true);
      
      const validateManager = async () => {
        try {
          // First check basic format
          if (!managerId.startsWith('MGR-')) {
            console.log(`Manager ID ${managerId} has invalid format`);
            setIsManagerIdValid(false);
            setIsValidatingManagerId(false);
            return;
          }
          
          // Use the validator hook
          const managerData = await validateManagerId(managerId);
          
          if (managerData) {
            console.log(`Validation successful for manager ID ${managerId}`);
            setIsManagerIdValid(true);
            setManagerName(managerData.name);
          } else {
            console.log(`Manager ID ${managerId} is invalid - not found in database`);
            setIsManagerIdValid(false);
          }
        } catch (error) {
          console.error("Error validating manager ID:", error);
          setIsManagerIdValid(false);
        } finally {
          setIsValidatingManagerId(false);
        }
      };
      
      // Use a small delay to avoid too many immediate validations while typing
      const timeoutId = setTimeout(validateManager, 500);
      return () => clearTimeout(timeoutId);
    }
  }, [managerId, userRole]);

  return {
    isValidatingManagerId,
    isManagerIdValid,
    managerName
  };
};
