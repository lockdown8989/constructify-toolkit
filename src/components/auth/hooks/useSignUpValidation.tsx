
import { useState, useEffect } from "react";
import { useManagerValidator } from "./employee-record/useManagerValidator";
import { UserRole } from "./useUserRole";

export const useSignUpValidation = (userRole: UserRole, managerId: string | null) => {
  const [isValidatingManagerId, setIsValidatingManagerId] = useState(false);
  const [isManagerIdValid, setIsManagerIdValid] = useState<boolean | undefined>(undefined);
  const [managerName, setManagerName] = useState<string | null>(null);
  const { validateManagerId } = useManagerValidator();

  // Validate the manager ID when it changes
  useEffect(() => {
    // Reset validation status when manager ID changes
    setIsManagerIdValid(undefined);
    setManagerName(null);
    
    // Only validate if role requires manager connection (employee or payroll)
    if ((userRole === 'employee' || userRole === 'payroll') && managerId) {
      console.log(`Validating manager ID for employee: ${managerId}`);
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
          
          // Use the validator hook to check the database
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
  }, [managerId, userRole, validateManagerId]);

  return {
    isValidatingManagerId,
    isManagerIdValid,
    managerName
  };
};
