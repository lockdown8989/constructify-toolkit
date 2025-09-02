import { useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface SignInAttempt {
  timestamp: number;
  email: string;
  success: boolean;
}

interface UseEnhancedSignInReturn {
  email: string;
  password: string;
  isLoading: boolean;
  errorMessage: string;
  canAttempt: boolean;
  attemptsRemaining: number;
  remainingBlockTime: number;
  handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handlePasswordReset: () => Promise<void>;
}

export const useEnhancedSignIn = (): UseEnhancedSignInReturn => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [attempts, setAttempts] = useState<SignInAttempt[]>([]);
  const [blockUntil, setBlockUntil] = useState<number>(0);
  
  const { toast } = useToast();
  
  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
  const ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes

  const cleanOldAttempts = useCallback(() => {
    const now = Date.now();
    return attempts.filter(attempt => 
      now - attempt.timestamp < ATTEMPT_WINDOW
    );
  }, [attempts]);

  const canAttempt = useCallback(() => {
    const now = Date.now();
    if (blockUntil > now) return false;
    
    const recentAttempts = cleanOldAttempts();
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    
    return failedAttempts.length < MAX_ATTEMPTS;
  }, [blockUntil, cleanOldAttempts]);

  const getAttemptsRemaining = useCallback(() => {
    const recentAttempts = cleanOldAttempts();
    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    return Math.max(0, MAX_ATTEMPTS - failedAttempts.length);
  }, [cleanOldAttempts]);

  const getRemainingBlockTime = useCallback(() => {
    const now = Date.now();
    return Math.max(0, Math.ceil((blockUntil - now) / 1000));
  }, [blockUntil]);

  const logAttempt = useCallback((success: boolean) => {
    const attempt: SignInAttempt = {
      timestamp: Date.now(),
      email: email.toLowerCase().trim(),
      success
    };
    
    setAttempts(prev => [...prev.slice(-19), attempt]); // Keep last 20 attempts
    
    if (!success) {
      const updatedAttempts = [...attempts, attempt];
      const recentFailures = updatedAttempts
        .filter(a => 
          !a.success && 
          Date.now() - a.timestamp < ATTEMPT_WINDOW &&
          a.email === email.toLowerCase().trim()
        );
      
      if (recentFailures.length >= MAX_ATTEMPTS) {
        setBlockUntil(Date.now() + BLOCK_DURATION);
        toast({
          title: "Account Temporarily Locked",
          description: "Too many failed attempts. Please wait 15 minutes before trying again.",
          variant: "destructive",
        });
      }
    }
  }, [email, attempts, toast]);

  const validateUserRole = async (userId: string) => {
    try {
      // Check if user has valid roles assigned
      const { data: userRoles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) {
        console.error("Error checking user roles:", error);
        return { isValid: false, message: "Error validating account roles" };
      }

      if (!userRoles || userRoles.length === 0) {
        return { 
          isValid: false, 
          message: "Account setup incomplete. Please contact your administrator to assign account roles." 
        };
      }

      // Check if user has employee record for employee/manager roles
      const hasEmployeeRole = userRoles.some(r => ['employee', 'manager'].includes(r.role));
      if (hasEmployeeRole) {
        const { data: employee, error: empError } = await supabase
          .from('employees')
          .select('id, manager_id, status')
          .eq('user_id', userId)
          .maybeSingle();

        if (empError) {
          console.error("Error checking employee record:", empError);
          return { isValid: false, message: "Error validating employee record" };
        }

        if (!employee) {
          return { 
            isValid: false, 
            message: "Employee record not found. Please contact your administrator." 
          };
        }

        if (employee.status !== 'Active') {
          return { 
            isValid: false, 
            message: `Account status: ${employee.status}. Please contact your administrator.` 
          };
        }
      }

      return { isValid: true, message: "Account validated successfully" };
    } catch (error) {
      console.error("Role validation error:", error);
      return { isValid: false, message: "Error validating account" };
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    if (errorMessage) setErrorMessage("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    if (!canAttempt()) {
      setErrorMessage("Too many failed attempts. Please wait before trying again.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      // Attempt sign in
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      });

      if (error) {
        logAttempt(false);
        
        if (error.message?.includes("Invalid login credentials")) {
          setErrorMessage("Invalid email or password. Please check your credentials.");
        } else if (error.message?.includes("Email not confirmed")) {
          setErrorMessage("Please verify your email address before signing in.");
        } else if (error.message?.includes("Too many requests")) {
          setErrorMessage("Too many requests. Please wait a moment and try again.");
        } else {
          setErrorMessage(error.message || "Sign in failed. Please try again.");
        }
        return;
      }

      if (data.user) {
        // Validate user roles and employee record
        const validation = await validateUserRole(data.user.id);
        
        if (!validation.isValid) {
          // Sign out the user since they can't proceed
          await supabase.auth.signOut();
          setErrorMessage(validation.message);
          logAttempt(false);
          return;
        }

        logAttempt(true);
        toast({
          title: "Welcome back!",
          description: "You have been signed in successfully.",
        });
      }
    } catch (error) {
      console.error("Sign in exception:", error);
      setErrorMessage("An unexpected error occurred. Please try again.");
      logAttempt(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email.trim()) {
      setErrorMessage("Please enter your email address first");
      return;
    }
    
    setIsLoading(true);
    setErrorMessage("");
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/auth?tab=reset-password`,
      });
      
      if (error) {
        setErrorMessage("Failed to send password reset email. Please try again.");
      } else {
        toast({
          title: "Password Reset Email Sent",
          description: "Please check your email for password reset instructions.",
        });
        setErrorMessage("");
      }
    } catch (error) {
      setErrorMessage("Failed to send password reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    password,
    isLoading,
    errorMessage,
    canAttempt: canAttempt(),
    attemptsRemaining: getAttemptsRemaining(),
    remainingBlockTime: getRemainingBlockTime(),
    handleEmailChange,
    handlePasswordChange,
    handleSubmit,
    handlePasswordReset
  };
};