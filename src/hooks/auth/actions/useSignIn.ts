
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useInputSanitization } from '../useInputSanitization';

/**
 * Secure sign-in hook with enhanced validation and error handling
 */
export const useSignIn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { sanitizeEmail, validateEmail } = useInputSanitization();

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    
    try {
      // Enhanced input validation and sanitization
      const cleanEmail = sanitizeEmail(email);
      
      if (!validateEmail(cleanEmail)) {
        throw new Error('Invalid email format');
      }
      
      if (!password || password.length < 6) {
        throw new Error('Invalid password');
      }
      
      if (password.length > 128) {
        throw new Error('Password too long');
      }
      
      // Attempt sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });
      
      if (error) {
        // Log security events for monitoring
        console.warn('Sign-in attempt failed:', {
          email: cleanEmail,
          error: error.message,
          timestamp: new Date().toISOString()
        });
        
        // Return standardized error response
        return {
          data: null,
          error: {
            message: getSecureErrorMessage(error.message),
            code: error.status || 'AUTH_ERROR'
          }
        };
      }
      
      if (!data.user) {
        return {
          data: null,
          error: {
            message: 'Authentication failed',
            code: 'NO_USER'
          }
        };
      }
      
      // Log successful authentication (without sensitive data)
      console.log('Successful sign-in:', {
        userId: data.user.id,
        email: cleanEmail,
        timestamp: new Date().toISOString()
      });
      
      return {
        data,
        error: null
      };
      
    } catch (error) {
      console.error('Sign-in error:', error);
      
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'An unexpected error occurred',
          code: 'UNKNOWN_ERROR'
        }
      };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Returns user-safe error messages to prevent information leakage
   */
  const getSecureErrorMessage = (originalMessage: string): string => {
    // Map technical errors to user-friendly messages
    const errorMap: { [key: string]: string } = {
      'Invalid login credentials': 'Invalid email or password',
      'Email not confirmed': 'Please verify your email address before signing in',
      'Too many requests': 'Too many sign-in attempts. Please try again later',
      'Invalid email': 'Please enter a valid email address',
      'Password should be at least 6 characters': 'Password must be at least 6 characters long'
    };
    
    // Return mapped message or generic error
    return errorMap[originalMessage] || 'Sign-in failed. Please check your credentials and try again';
  };

  return {
    signIn,
    isLoading
  };
};
