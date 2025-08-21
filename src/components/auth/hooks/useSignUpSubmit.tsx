
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
  validateForm
}: UseSignUpSubmitProps) => {
  const { toast } = useToast();
  const [signUpError, setSignUpError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsLoading(true);
    setSignUpError(null);
    
    try {
      console.log(`Attempting to sign up with role: ${userRole}, Manager ID: ${managerId}`);
      
      // Validate form first
      if (!validateForm()) {
        setSignUpError("Please fill in all required fields");
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
      
      // Create proper metadata object for Supabase
      const userMetadata = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        full_name: getFullName(),
        user_role: userRole,
        manager_id: managerId || null
      };
      
      // Call the sign up function with proper metadata
      const result = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: userMetadata,
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        },
      });
      
      if (result.error) {
        console.error("Sign up error:", result.error);
        
        // Provide more specific error messages
        if (result.error.message.includes("duplicate key") || result.error.message.includes("already registered")) {
          setSignUpError("This email is already registered. Please try signing in instead.");
        } else if (result.error.message.includes("permission denied") || result.error.message.includes("Database error")) {
          setSignUpError("Account created but profile setup encountered an issue. You may need to update your profile details later.");
          console.error("Database permission error during signup:", result.error);
          
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
          setSignUpError(result.error.message || "Failed to create account. Please try again.");
        }
        
        setIsLoading(false);
        return;
      }
      
      if (result.data?.user && !result.data.user.email_confirmed_at) {
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
      
      // User is created and confirmed
      if (result.data?.user) {
        console.log(`Got user with ID: ${result.data.user.id}, assigning role: ${userRole}, manager ID: ${managerId || 'none'}`);
        
        // Try role assignment and employee record creation in parallel
        const [roleSuccess, employeeSuccess] = await Promise.allSettled([
          assignUserRole(result.data.user.id, userRole),
          createOrUpdateEmployeeRecord(
            result.data.user.id,
            getFullName(),
            userRole,
            managerId
          )
        ]);

        console.log("Role assignment result:", roleSuccess);
        console.log("Employee record creation result:", employeeSuccess);
        
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
        
        // Auto-redirect to dashboard for successful signups
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setSignUpError("User created but session not established. Please try signing in.");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Sign up error:", error);
      setSignUpError(error instanceof Error ? error.message : "An unexpected error occurred during sign up");
      setIsLoading(false);
    }
  };

  return {
    signUpError,
    handleSubmit
  };
};
