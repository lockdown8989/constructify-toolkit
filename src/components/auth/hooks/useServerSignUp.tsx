import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/hooks/auth/types";

type UseServerSignUpProps = {
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
}

export const useServerSignUp = ({ onSignUp }: UseServerSignUpProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [signUpError, setSignUpError] = useState<string | null>(null);
  
  const handleSubmit = async (
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    userRole: UserRole,
    managerId: string | null
  ) => {
    setIsLoading(true);
    setSignUpError(null);
    
    try {
      // Validate required fields
      if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
        setSignUpError("Please fill in all required fields");
        setIsLoading(false);
        return;
      }

      // Validate password strength
      if (password.length < 8) {
        setSignUpError("Password must be at least 8 characters long");
        setIsLoading(false);
        return;
      }

      // Require manager ID for employees and payroll users
      if ((userRole === 'employee' || userRole === 'payroll') && !managerId) {
        setSignUpError("Manager ID is required for employee and payroll accounts");
        setIsLoading(false);
        return;
      }

      console.log(`🚀 Starting server-side registration for ${userRole} with manager ID: ${managerId || 'none'}`);
      
      // First, create the auth user
      const { data: authResult, error: authError } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth?verified=true`,
        },
      });

      if (authError) {
        console.error("❌ Auth signup error:", authError);
        
        if (authError.message.includes("duplicate key") || authError.message.includes("already registered")) {
          setSignUpError("This email is already registered. Please try signing in instead.");
        } else {
          setSignUpError(authError.message || "Failed to create account. Please try again.");
        }
        setIsLoading(false);
        return;
      }

      if (!authResult.user) {
        setSignUpError("Failed to create user account. Please try again.");
        setIsLoading(false);
        return;
      }

      // Proceed to complete registration immediately (email verification may still be required for login)
      // We still send the verification email via redirect option above, but we finish profile/role setup now.

      // User is confirmed - complete registration with server function
      console.log(`✅ Auth user created: ${authResult.user.id}, completing registration...`);
      
      const { data: registrationResult, error: registrationError } = await supabase.rpc('complete_user_registration', {
        p_user_id: authResult.user.id,
        p_email: email.trim().toLowerCase(),
        p_first_name: firstName.trim(),
        p_last_name: lastName.trim(),
        p_user_role: userRole,
        p_manager_id: managerId
      });

      if (registrationError) {
        console.error("❌ Registration completion error:", registrationError);
        toast({
          title: "Account created with issues",
          description: "Your account was created but some settings couldn't be saved. You can update them later.",
          variant: "default",
        });
      } else if (registrationResult?.success) {
        console.log("✅ Registration completed successfully:", registrationResult);
        
        // Handle manager subscription requirement
        if (userRole === 'manager') {
          if (registrationResult.manager_id) {
            toast({
              title: "Manager Account Created! 🎉",
              description: `Your Manager ID is ${registrationResult.manager_id}. You'll need to subscribe to activate your team's access.`,
              duration: 10000,
            });
            
            // For managers, redirect to subscription flow instead of dashboard
            setTimeout(() => {
              window.location.href = '/subscription-required';
            }, 2000);
            return;
          }
        } else if ((userRole === 'employee' || userRole === 'payroll') && managerId) {
          toast({
            title: "Success! 🎉",
            description: `Account created and linked to manager with ID ${managerId}. You'll have access once your manager subscribes.`,
          });
        } else {
          toast({
            title: "Success! 🎉",
            description: `${userRole} account created successfully.`,
          });
        }
      } else {
        console.error("❌ Registration failed:", registrationResult);
        toast({
          title: "Account created with issues",
          description: registrationResult?.error || "Some settings couldn't be saved. You can update them later.",
          variant: "default",
        });
      }
      
      // Wait for role assignment to complete before redirecting
      setTimeout(() => {
        // Force a full page reload to ensure clean auth state
        window.location.href = '/dashboard';
      }, 3000);
      
    } catch (error) {
      console.error("💥 Unexpected signup error:", error);
      setSignUpError(error instanceof Error ? error.message : "An unexpected error occurred during sign up");
      setIsLoading(false);
    }
  };

  return {
    handleSubmit,
    isLoading,
    signUpError,
    setSignUpError
  };
};