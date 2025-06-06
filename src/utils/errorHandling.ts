
import { AuthError } from '@supabase/supabase-js';

export class SecureError extends Error {
  public readonly isSecure = true;
  public readonly userMessage: string;
  
  constructor(userMessage: string, internalMessage?: string) {
    super(internalMessage || userMessage);
    this.userMessage = userMessage;
    this.name = 'SecureError';
  }
}

export const getSecureErrorMessage = (error: unknown): string => {
  if (error instanceof SecureError) {
    return error.userMessage;
  }
  
  if (error instanceof Error) {
    // Don't expose internal error details to users
    if (error.message.includes('Database error') || 
        error.message.includes('connection') ||
        error.message.includes('timeout')) {
      return 'Service temporarily unavailable. Please try again later.';
    }
    
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password. Please check your credentials.';
    }
    
    if (error.message.includes('Email not confirmed')) {
      return 'Please verify your email address before signing in.';
    }
    
    if (error.message.includes('Too many requests')) {
      return 'Too many attempts. Please wait before trying again.';
    }
  }
  
  return 'An unexpected error occurred. Please try again.';
};

export const logSecureError = (error: unknown, context: string) => {
  // In production, this would integrate with your logging service
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, error);
  }
  
  // Here you would send to your logging service like Sentry, LogRocket, etc.
  // Example: Sentry.captureException(error, { tags: { context } });
};

export const handleAuthError = (error: AuthError | Error, context: string): string => {
  logSecureError(error, context);
  return getSecureErrorMessage(error);
};
