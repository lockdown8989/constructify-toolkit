
import { useState, useCallback } from 'react';
import { useInputSanitization } from '@/hooks/auth/useInputSanitization';

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitizedValue: string;
}

export const useSecurityValidation = () => {
  const { sanitizeInput } = useInputSanitization();
  const [rateLimitCache, setRateLimitCache] = useState<Map<string, number>>(new Map());

  // Rate limiting for sensitive operations
  const checkRateLimit = useCallback((key: string, maxAttempts: number = 5, windowMs: number = 300000): boolean => {
    const now = Date.now();
    const attempts = rateLimitCache.get(key) || 0;
    
    // Clean old entries
    const windowStart = now - windowMs;
    const filteredEntries = new Map(
      Array.from(rateLimitCache.entries()).filter(([k, time]) => 
        time > windowStart || k === key
      )
    );
    
    if (attempts >= maxAttempts) {
      return false;
    }
    
    filteredEntries.set(key, now);
    setRateLimitCache(filteredEntries);
    return true;
  }, [rateLimitCache]);

  // Validate and sanitize manager ID
  const validateManagerId = useCallback((managerId: string): ValidationResult => {
    const errors: string[] = [];
    let sanitizedValue = sanitizeInput(managerId);

    if (!sanitizedValue || sanitizedValue.length < 3) {
      errors.push('Manager ID must be at least 3 characters long');
    }

    if (!/^[A-Z0-9-]+$/i.test(sanitizedValue)) {
      errors.push('Manager ID can only contain letters, numbers, and hyphens');
    }

    if (sanitizedValue.length > 20) {
      errors.push('Manager ID cannot exceed 20 characters');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue
    };
  }, [sanitizeInput]);

  // Validate email without revealing if it exists
  const validateEmailSecure = useCallback((email: string): ValidationResult => {
    const errors: string[] = [];
    const sanitizedValue = sanitizeInput(email);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedValue)) {
      errors.push('Please enter a valid email address');
    }

    if (sanitizedValue.length > 254) {
      errors.push('Email address is too long');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue
    };
  }, [sanitizeInput]);

  // Validate user names and prevent XSS
  const validateUserName = useCallback((name: string): ValidationResult => {
    const errors: string[] = [];
    let sanitizedValue = sanitizeInput(name);

    if (!sanitizedValue || sanitizedValue.trim().length < 2) {
      errors.push('Name must be at least 2 characters long');
    }

    if (sanitizedValue.length > 100) {
      errors.push('Name cannot exceed 100 characters');
    }

    // Remove any remaining potentially dangerous characters
    sanitizedValue = sanitizedValue.replace(/[<>\"']/g, '');

    if (!/^[a-zA-Z\s\-\.]+$/.test(sanitizedValue)) {
      errors.push('Name can only contain letters, spaces, hyphens, and periods');
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue
    };
  }, [sanitizeInput]);

  // Validate text fields and prevent XSS
  const validateTextField = useCallback((text: string, maxLength: number = 500): ValidationResult => {
    const errors: string[] = [];
    const sanitizedValue = sanitizeInput(text);

    if (sanitizedValue.length > maxLength) {
      errors.push(`Text cannot exceed ${maxLength} characters`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      sanitizedValue
    };
  }, [sanitizeInput]);

  return {
    validateManagerId,
    validateEmailSecure,
    validateUserName,
    validateTextField,
    checkRateLimit
  };
};
