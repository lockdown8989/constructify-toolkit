
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
  // Mask sensitive information before logging
  const sanitizedError = maskSensitiveData(error);
  
  // In production, this would integrate with your logging service
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context}]`, sanitizedError);
  }
  
  // Here you would send to your logging service like Sentry, LogRocket, etc.
  // Example: Sentry.captureException(sanitizedError, { tags: { context } });
};

const maskSensitiveData = (data: unknown): unknown => {
  if (typeof data === 'string') {
    return data
      .replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, '****-****-****-****') // Credit cards
      .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '***@***.***') // Emails
      .replace(/\b\d{3}[-.]?\d{2}[-.]?\d{4}\b/g, '***-**-****'); // SSN-like patterns
  }
  
  if (data && typeof data === 'object') {
    const masked = { ...data } as any;
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'ssn', 'credit_card'];
    
    for (const key of Object.keys(masked)) {
      if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
        masked[key] = '***REDACTED***';
      } else if (typeof masked[key] === 'object') {
        masked[key] = maskSensitiveData(masked[key]);
      }
    }
    return masked;
  }
  
  return data;
};

export const handleAuthError = (error: AuthError | Error, context: string): string => {
  logSecureError(error, context);
  return getSecureErrorMessage(error);
};
