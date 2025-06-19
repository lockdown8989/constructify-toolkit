
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInputSanitization } from '../useInputSanitization';

/**
 * Secure sign-up hook with enhanced validation and security checks
 */
export const useSignUp = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { sanitizeEmail, sanitizeName, validateEmail, validatePassword } = useInputSanitization();

  const signUp = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ) => {
    setIsLoading(true);
    
    try {
      // Enhanced input validation and sanitization
      const cleanEmail = sanitizeEmail(email);
      const cleanFirstName = sanitizeName(firstName);
      const cleanLastName = sanitizeName(lastName);
      
      // Comprehensive validation
      if (!validateEmail(cleanEmail)) {
        throw new Error('Please enter a valid email address');
      }
      
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0]);
      }
      
      if (!cleanFirstName || cleanFirstName.length < 1) {
        throw new Error('First name is required');
      }
      
      if (!cleanLastName || cleanLastName.length < 1) {
        throw new Error('Last name is required');
      }
      
      // Check for suspicious patterns
      if (cleanFirstName.toLowerCase() === cleanLastName.toLowerCase()) {
        throw new Error('Please enter a valid first and last name');
      }
      
      // Attempt sign up with Supabase
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          data: {
            first_name: cleanFirstName,
            last_name: cleanLastName,
            full_name: `${cleanFirstName} ${cleanLastName}`
          },
          emailRedirectTo: `${window.location.origin}/auth`
        }
      });
      
      if (error) {
        // Log security events for monitoring
        console.warn('Sign-up attempt failed:', {
          email: cleanEmail,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        return {
          data: null,
          error: {
            message: getSecureErrorMessage(error.message),
            code: error.status || 'AUTH_ERROR'
          },
          requiresConfirmation: false
        };
      }
      
      // Check if email confirmation is required
      const requiresConfirmation = !data.session && data.user && !data.user.email_confirmed_at;
      
      if (requiresConfirmation) {
        console.log('Sign-up requires email confirmation:', {
          userId: data.user?.id,
          email: cleanEmail,
          timestamp: new Date().toISOString()
        });
      } else if (data.user) {
        console.log('Successful sign-up:', {
          userId: data.user.id,
          email: cleanEmail,
          timestamp: new Date().toISOString()
        });
      }
      
      return {
        data,
        error: null,
        requiresConfirmation
      };
      
    } catch (error) {
      console.error('Sign-up error:', error);
      
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred during sign-up',
          code: 'UNKNOWN_ERROR'
        },
        requiresConfirmation: false
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Returns user-safe error messages to prevent information leakage
   */
  const getSecureErrorMessage = (originalMessage: string): string => {
    const errorMap: { [key: string]: string } = {
      'User already registered': 'An account with this email already exists. Please sign in instead.',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long',
      'Invalid email': 'Please enter a valid email address',
      'Email rate limit exceeded': 'Too many sign-up attempts. Please try again later.',
      'Signup is disabled': 'Account registration is currently disabled. Please contact support.'
    };
    
    return errorMap[originalMessage] || 'Account creation failed. Please try again or contact support.';
  };

  return {
    signUp,
    isLoading
  };
};
