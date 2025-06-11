
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "./useUserRole";

type UseSignUpSubmitProps = {
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  setIsLoading: (loading: boolean) => void;
  userRole: UserRole;
  managerId: string;
  assignUserRole: (userId: string, userRole: UserRole) => Promise<boolean>;
  createOrUpdateEmployeeRecord: (
    userId: string, 
    fullName: string, 
    userRole: UserRole, 
    managerId: string | null
  ) => Promise<boolean>;
  getFullName: () => string;
  canAttempt: boolean;
  attemptsRemaining: number;
  remainingBlockTime: number;
  recordFailedAttempt: () => void;
  recordSuccessfulAuth: () => void;
  validateForm: () => boolean;
};

export const useSignUpSubmit = ({
  onSignUp,
  email,
  password,
  firstName,
  lastName,
  setIsLoading,
  userRole,
  managerId,
  assignUserRole,
  createOrUpdateEmployeeRecord,
  getFullName,
  canAttempt,
  attemptsRemaining,
  remainingBlockTime,
  recordFailedAttempt,
  recordSuccessfulAuth,
  validateForm
}: UseSignUpSubmitProps) => {
  const { toast } = useToast();
  const [signUpError, setSignUpError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canAttempt) {
      const minutes = Math.ceil(remainingBlockTime / 60);
      setSignUpError(`Too many failed attempts. Please try again in ${minutes} minutes.`);
      return;
    }
    
    setIsLoading(true);
    setSignUpError(null);
    
    try {
      console.log(`Attempting to sign up with role: ${userRole}, Manager ID: ${managerId}`);
      
      // Validate form first
      if (!validateForm()) {
        setIsLoading(false);
        return;
      }
      
      // Require manager ID for employees and payroll users
      if ((userRole === 'employee' || userRole === 'payroll') && !managerId) {
        setSignUpError("Manager ID is required for employee and payroll accounts");
        setIsLoading(false);
        return;
      }
      
      // Validate manager ID format for employees and payroll users
      if ((userRole === 'employee' || userRole === 'payroll') && managerId && !managerId.startsWith('MGR-')) {
        setSignUpError("Invalid Manager ID format. Manager IDs must start with 'MGR-'");
        setIsLoading(false);
        return;
      }
      
      // Call the sign up function provided via props
      const { error, data, requiresConfirmation } = await onSignUp(
        email, 
        password, 
        firstName, 
        lastName
      );
      
      if (error) {
        console.error("Sign up error:", error);
        recordFailedAttempt();
        
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
          setSignUpError(`${error.message || "Failed to create account. Please try again."} ${attemptsRemaining - 1} attempts remaining.`);
        }
        
        setIsLoading(false);
        return;
      }
      
      if (requiresConfirmation) {
        recordSuccessfulAuth();
        // Handle email confirmation case
        toast({
          title: "Email verification required",
          description: "Please check your email to verify your account before signing in.",
        });
        
        setIsLoading(false);
        setTimeout(() => {
          window.location.href = '/auth';
        }, 3000);
        return;
      }
      
      // Attempt to get the user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        console.log(`Got user with ID: ${user.id}, assigning role: ${userRole}, manager ID: ${managerId || 'none'}`);
        
        // Try role assignment and employee record creation in parallel
        const [roleSuccess, employeeSuccess] = await Promise.allSettled([
          assignUserRole(user.id, userRole),
          createOrUpdateEmployeeRecord(
            user.id,
            getFullName(),
            userRole,
            managerId
          )
        ]);

        console.log("Role assignment result:", roleSuccess);
        console.log("Employee record creation result:", employeeSuccess);
        
        recordSuccessfulAuth();
        
        // Show appropriate success message based on role
        if (userRole === 'manager') {
          toast({
            title: "Success",
            description: `Manager account created. Your Manager ID is ${managerId}. Share this with your employees to connect them to your account.`,
            duration: 6000,
          });
        } else if (userRole === 'payroll' && managerId) {
          toast({
            title: "Success", 
            description: `Payroll account created and linked to manager with ID ${managerId}.`,
          });
        } else if (userRole === 'employee' && managerId) {
          toast({
            title: "Success", 
            description: `Account created and linked to your manager with ID ${managerId}.`,
          });
        } else {
          toast({
            title: "Success", 
            description: `Account created with ${userRole} role.`,
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
        
        // Sign in automatically after successful registration for manager accounts
        if (userRole === 'manager') {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password
          });
          
          if (!signInError) {
            // Short delay to allow roles to be properly assigned
            setTimeout(() => {
              window.location.href = '/dashboard';
            }, 1500);
          } else {
            // If auto-login fails, redirect to auth page
            setTimeout(() => {
              window.location.href = '/auth';
            }, 3000);
          }
        } else {
          // For non-manager accounts, redirect to sign in after a slight delay
          setTimeout(() => {
            window.location.href = '/auth';
          }, 3000);
        }
      } else {
        recordFailedAttempt();
        setSignUpError("User created but session not established. Please try signing in.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      recordFailedAttempt();
      setSignUpError(`${error instanceof Error ? error.message : "An unexpected error occurred during sign up"} ${attemptsRemaining - 1} attempts remaining.`);
      setIsLoading(false);
    }
  };

  return {
    signUpError,
    handleSubmit
  };
};
