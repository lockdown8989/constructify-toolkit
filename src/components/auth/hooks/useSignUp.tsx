
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
  const [signUpError, setSignUpError] = useState<string | null>(null);
  
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
    setSignUpError(null);
    
    try {
      console.log(`Attempting to sign up with role: ${roleManager.userRole}`);
      
      // Validate required fields
      if (!formState.email || !formState.password || !formState.firstName || !formState.lastName) {
        setSignUpError("All fields are required");
        formState.setIsLoading(false);
        return;
      }
      
      if (formState.password.length < 6) {
        setSignUpError("Password must be at least 6 characters");
        formState.setIsLoading(false);
        return;
      }
      
      // Call the sign up function provided via props
      const { error, data, requiresConfirmation } = await onSignUp(
        formState.email, 
        formState.password, 
        formState.firstName, 
        formState.lastName
      );
      
      if (error) {
        console.error("Sign up error:", error);
        
        // Provide more specific error messages
        if (error.message.includes("duplicate key") || error.message.includes("already registered")) {
          setSignUpError("This email is already registered. Please try signing in instead.");
        } else if (error.message.includes("permission denied") || error.message.includes("Database error")) {
          setSignUpError("Account created but profile setup encountered an issue. You may need to update your profile details later.");
          console.error("Database permission error during signup:", error);
          
          // Show toast with more information
          toast({
            title: "Account created with limited setup",
            description: "Your account was created, but some profile information couldn't be saved. You can update it later.",
            variant: "default",
          });
          
          // Redirect to sign in after a delay
          setTimeout(() => {
            window.location.href = '/auth';
          }, 3000);
          
          return;
        } else {
          setSignUpError(error.message || "Failed to create account. Please try again.");
        }
        
        formState.setIsLoading(false);
        return;
      }
      
      if (requiresConfirmation) {
        // Handle email confirmation case
        toast({
          title: "Email verification required",
          description: "Please check your email to verify your account before signing in.",
        });
        
        formState.setIsLoading(false);
        setTimeout(() => {
          window.location.href = '/auth';
        }, 3000);
        return;
      }
      
      // Attempt to get the user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log(`Got user with ID: ${user.id}, assigning role: ${roleManager.userRole}`);
        
        // Try role assignment and employee record creation in parallel
        const [roleSuccess, employeeSuccess] = await Promise.allSettled([
          roleAssigner.assignUserRole(user.id, roleManager.userRole),
          employeeManager.createOrUpdateEmployeeRecord(
            user.id,
            formState.getFullName(),
            roleManager.userRole,
            roleManager.userRole === 'employer' ? roleManager.managerId : roleManager.managerId
          )
        ]);
        
        // Show appropriate success message
        if (roleManager.userRole === 'employer') {
          toast({
            title: "Success",
            description: `Account created with manager role. Your Manager ID is ${roleManager.managerId}. Share this with your employees to connect them to your account.`,
          });
        } else if (roleManager.userRole === 'employee' && roleManager.managerId) {
          toast({
            title: "Success", 
            description: `Account created and linked to your manager with ID ${roleManager.managerId}.`,
          });
        } else {
          toast({
            title: "Success", 
            description: `Account created with ${roleManager.userRole} role.`,
          });
        }
        
        // Show warning if role assignment or employee record creation failed
        if (roleSuccess.status === 'rejected' || employeeSuccess.status === 'rejected' || 
           (roleSuccess.status === 'fulfilled' && !roleSuccess.value) || 
           (employeeSuccess.status === 'fulfilled' && !employeeSuccess.value)) {
          toast({
            title: "Warning",
            description: "Your account was created, but some settings couldn't be saved. You can update them later in your profile.",
            variant: "default",
          });
        }
        
        // Redirect to sign in after a slight delay to ensure toasts are visible
        setTimeout(() => {
          window.location.href = '/auth';
        }, 3000);
      } else {
        setSignUpError("User created but session not established. Please try signing in.");
        formState.setIsLoading(false);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setSignUpError(error instanceof Error ? error.message : "An unexpected error occurred during sign up");
      formState.setIsLoading(false);
    }
  };

  return {
    ...formState,
    ...roleManager,
    isValidatingManagerId,
    isManagerIdValid,
    signUpError,
    handleSubmit
  };
};
