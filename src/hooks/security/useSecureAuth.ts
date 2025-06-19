
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSecurityValidation } from './useSecurityValidation';

interface AuthAttempt {
  email: string;
  timestamp: number;
  success: boolean;
}

export const useSecureAuth = () => {
  const { toast } = useToast();
  const { checkRateLimit, validateEmailSecure } = useSecurityValidation();
  const [authAttempts, setAuthAttempts] = useState<AuthAttempt[]>([]);

  // Check if user is locked out
  const isAccountLocked = useCallback((email: string): boolean => {
    const recentAttempts = authAttempts.filter(
      attempt => 
        attempt.email === email && 
        Date.now() - attempt.timestamp < 900000 && // 15 minutes
        !attempt.success
    );
    
    return recentAttempts.length >= 5;
  }, [authAttempts]);

  // Log authentication attempt
  const logAuthAttempt = useCallback((email: string, success: boolean) => {
    const attempt: AuthAttempt = {
      email,
      timestamp: Date.now(),
      success
    };

    setAuthAttempts(prev => {
      const filtered = prev.filter(a => Date.now() - a.timestamp < 900000);
      return [...filtered, attempt];
    });
  }, []);

  // Secure sign-in with rate limiting and validation
  const secureSignIn = useCallback(async (
    email: string, 
    password: string, 
    originalSignIn: (email: string, password: string) => Promise<any>
  ) => {
    // Validate email format
    const emailValidation = validateEmailSecure(email);
    if (!emailValidation.isValid) {
      toast({
        title: "Invalid Input",
        description: emailValidation.errors[0],
        variant: "destructive"
      });
      return { error: { message: "Invalid email format" } };
    }

    const sanitizedEmail = emailValidation.sanitizedValue;

    // Check rate limiting
    if (!checkRateLimit(`auth_${sanitizedEmail}`, 5, 900000)) {
      toast({
        title: "Too Many Attempts",
        description: "Too many login attempts. Please try again in 15 minutes.",
        variant: "destructive"
      });
      return { error: { message: "Rate limit exceeded" } };
    }

    // Check account lockout
    if (isAccountLocked(sanitizedEmail)) {
      toast({
        title: "Account Temporarily Locked",
        description: "Account is temporarily locked due to multiple failed attempts.",
        variant: "destructive"
      });
      return { error: { message: "Account locked" } };
    }

    try {
      const result = await originalSignIn(sanitizedEmail, password);
      
      if (result.error) {
        logAuthAttempt(sanitizedEmail, false);
        // Generic error message to prevent user enumeration
        toast({
          title: "Authentication Failed",
          description: "Invalid credentials. Please check your email and password.",
          variant: "destructive"
        });
      } else {
        logAuthAttempt(sanitizedEmail, true);
      }

      return result;
    } catch (error) {
      logAuthAttempt(sanitizedEmail, false);
      toast({
        title: "Authentication Error",
        description: "An error occurred during authentication. Please try again.",
        variant: "destructive"
      });
      return { error: { message: "Authentication failed" } };
    }
  }, [validateEmailSecure, checkRateLimit, isAccountLocked, logAuthAttempt, toast]);

  return {
    secureSignIn,
    isAccountLocked,
    logAuthAttempt
  };
};
