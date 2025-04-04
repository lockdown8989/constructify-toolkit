
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSignUpForm } from "./useSignUpForm";
import { useUserRole } from "./useUserRole";
import { useEmployeeRecord } from "./useEmployeeRecord";
import { useRoleAssignment } from "./useRoleAssignment";
import { useState, useEffect } from "react";

type UseSignUpProps = {
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
}

export const useSignUp = ({ onSignUp }: UseSignUpProps) => {
  const { toast } = useToast();
  const formState = useSignUpForm();
  const roleManager = useUserRole();
  const employeeManager = useEmployeeRecord();
  const roleAssigner = useRoleAssignment();
  const [isValidatingManagerId, setIsValidatingManagerId] = useState(false);
  const [isManagerIdValid, setIsManagerIdValid] = useState<boolean | undefined>(undefined);
  
  // Validate the manager ID when it changes
  useEffect(() => {
    // Reset validation status when manager ID changes
    setIsManagerIdValid(undefined);
    
    // Only validate if this is an employee role with a manager ID
    if (roleManager.userRole === 'employee' && roleManager.managerId) {
      setIsValidatingManagerId(true);
      
      const validateManagerId = async () => {
        try {
          const { data, error } = await supabase
            .from('employees')
            .select('id')
            .eq('manager_id', roleManager.managerId)
            .eq('job_title', 'Manager')
            .single();
            
          if (error || !data) {
            console.log(`Manager ID ${roleManager.managerId} is invalid`);
            setIsManagerIdValid(false);
          } else {
            console.log(`Manager ID ${roleManager.managerId} is valid`);
            setIsManagerIdValid(true);
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
  }, [roleManager.managerId, roleManager.userRole]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    formState.setIsLoading(true);
    
    try {
      console.log(`Attempting to sign up with role: ${roleManager.userRole}`);
      
      // Call the sign up function provided via props
      const { error } = await onSignUp(
        formState.email, 
        formState.password, 
        formState.firstName, 
        formState.lastName
      );
      
      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log(`Got user with ID: ${user.id}, assigning role: ${roleManager.userRole}`);
          
          // Assign user role
          const roleSuccess = await roleAssigner.assignUserRole(user.id, roleManager.userRole);
          
          if (!roleSuccess) {
            formState.setIsLoading(false);
            return;
          }
          
          // Create or update employee record
          const employeeSuccess = await employeeManager.createOrUpdateEmployeeRecord(
            user.id,
            formState.getFullName(),
            roleManager.userRole,
            roleManager.userRole === 'employee' ? roleManager.managerId : roleManager.managerId
          );
          
          // Show appropriate success message
          if (roleManager.userRole === 'employer') {
            toast({
              title: "Success",
              description: `Account created/updated with manager role. Your Manager ID is ${roleManager.managerId}. Share this with your employees to connect them to your account.`,
            });
          } else if (roleManager.userRole === 'employee' && roleManager.managerId) {
            toast({
              title: "Success", 
              description: `Account created/updated and linked to your manager with ID ${roleManager.managerId}.`,
            });
          } else {
            toast({
              title: "Success", 
              description: `Account created/updated with ${roleManager.userRole} role.`,
            });
          }
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      formState.setIsLoading(false);
    }
  };

  return {
    ...formState,
    ...roleManager,
    isValidatingManagerId,
    isManagerIdValid,
    handleSubmit
  };
};
