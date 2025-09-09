import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SignInAttempt {
  email: string;
  timestamp: number;
  success: boolean;
}

export const useConsolidatedSignIn = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Rate limiting state
  const [signInAttempts, setSignInAttempts] = useState<SignInAttempt[]>([]);
  
  // Constants for rate limiting
  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
  const ATTEMPT_WINDOW = 10 * 60 * 1000; // 10 minutes

  // Clean expired attempts
  const cleanOldAttempts = (attempts: SignInAttempt[]) => {
    const now = Date.now();
    return attempts.filter(attempt => now - attempt.timestamp < ATTEMPT_WINDOW);
  };

  // Check if user can attempt login
  const canAttempt = () => {
    const cleanedAttempts = cleanOldAttempts(signInAttempts);
    const recentFailures = cleanedAttempts.filter(
      attempt => !attempt.success && attempt.email === email
    );
    
    if (recentFailures.length >= MAX_ATTEMPTS) {
      const oldestFailure = recentFailures[0];
      return Date.now() - oldestFailure.timestamp > BLOCK_DURATION;
    }
    
    return true;
  };

  const getAttemptsRemaining = () => {
    const cleanedAttempts = cleanOldAttempts(signInAttempts);
    const recentFailures = cleanedAttempts.filter(
      attempt => !attempt.success && attempt.email === email
    );
    return Math.max(0, MAX_ATTEMPTS - recentFailures.length);
  };

  const getRemainingBlockTime = () => {
    const cleanedAttempts = cleanOldAttempts(signInAttempts);
    const recentFailures = cleanedAttempts.filter(
      attempt => !attempt.success && attempt.email === email
    );
    
    if (recentFailures.length >= MAX_ATTEMPTS) {
      const oldestFailure = recentFailures[0];
      const blockEndTime = oldestFailure.timestamp + BLOCK_DURATION;
      return Math.max(0, blockEndTime - Date.now()) / 1000;
    }
    
    return 0;
  };

  const logAttempt = (email: string, success: boolean) => {
    const attempt: SignInAttempt = {
      email,
      timestamp: Date.now(),
      success
    };
    
    setSignInAttempts(prev => {
      const cleaned = cleanOldAttempts([...prev, attempt]);
      return cleaned;
    });
  };

  const validateUserRole = async (userId: string) => {
    try {
      // Check if user has any roles assigned
      const { data: userRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (roleError) {
        console.error('Error checking user roles:', roleError);
        return { valid: true, message: null }; // Allow login but user can set up roles later
      }

      if (!userRoles || userRoles.length === 0) {
        return { 
          valid: false, 
          message: 'Your account is not properly set up. Please contact your administrator.' 
        };
      }

      // Check if user has an employee record
      const { data: employee, error: employeeError } = await supabase
        .from('employees')
        .select('id, name, status')
        .eq('user_id', userId)
        .maybeSingle();

      if (employeeError) {
        console.error('Error checking employee record:', employeeError);
        return { valid: true, message: null };
      }

      if (!employee) {
        return { 
          valid: false, 
          message: 'Your employee profile is missing. Please contact your administrator.' 
        };
      }

      if (employee.status !== 'Active') {
        return { 
          valid: false, 
          message: 'Your account is not active. Please contact your administrator.' 
        };
      }

      return { valid: true, message: null };
    } catch (error) {
      console.error('Error validating user role:', error);
      return { valid: true, message: null }; // Allow login on validation errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setErrorMessage("Please enter both email and password");
      return;
    }

    if (!canAttempt()) {
      const remainingTime = Math.ceil(getRemainingBlockTime() / 60);
      setErrorMessage(`Too many failed attempts. Please try again in ${remainingTime} minutes.`);
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      console.log('🔐 Attempting secure sign in for:', email);
      
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError) {
        console.error('❌ Sign in failed:', authError);
        logAttempt(email, false);
        
        // Handle specific error cases
        if (authError.message.includes('Invalid login credentials')) {
          setErrorMessage("Invalid email or password. Please check your credentials and try again.");
        } else if (authError.message.includes('Email not confirmed')) {
          setErrorMessage("Please verify your email address before signing in. Check your inbox for the verification link.");
        } else if (authError.message.includes('Too many requests')) {
          setErrorMessage("Too many sign-in attempts. Please wait a few minutes before trying again.");
        } else {
          setErrorMessage(authError.message || "Sign in failed. Please try again.");
        }
        
        setIsLoading(false);
        return;
      }

      if (!authData.user) {
        logAttempt(email, false);
        setErrorMessage("Sign in failed. Please try again.");
        setIsLoading(false);
        return;
      }

      console.log('✅ Auth successful, validating user profile...');
      
      // Validate user role and employee status
      const { valid, message } = await validateUserRole(authData.user.id);
      
      if (!valid && message) {
        logAttempt(email, false);
        setErrorMessage(message);
        
        // Sign out the user since their account is not properly set up
        await supabase.auth.signOut();
        setIsLoading(false);
        return;
      }

      console.log('✅ Sign in completed successfully');
      logAttempt(email, true);
      
      toast({
        title: "Welcome back! 👋",
        description: "You have been signed in successfully.",
      });

      // The auth state change will handle the redirect
      
    } catch (error) {
      console.error('💥 Unexpected sign in error:', error);
      logAttempt(email, false);
      setErrorMessage(error instanceof Error ? error.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setErrorMessage("Please enter your email address first");
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('send-password-reset', {
        body: { email: email.toLowerCase().trim() }
      });
      
      if (error) {
        console.error('Password reset error:', error);
        setErrorMessage("Failed to send password reset email: " + error.message);
      } else {
        toast({
          title: "Password reset sent 📧",
          description: "Check your email for password reset instructions.",
        });
        setErrorMessage(null);
      }
    } catch (error) {
      setErrorMessage("Failed to send password reset email");
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
    handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setEmail(e.target.value);
      setErrorMessage(null);
    },
    handlePasswordChange: (e: React.ChangeEvent<HTMLInputElement>) => {
      setPassword(e.target.value);
      setErrorMessage(null);
    },
    handleSubmit,
    handlePasswordReset,
  };
};