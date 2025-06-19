
import { useMemo } from 'react';

/**
 * Enhanced input sanitization hook with comprehensive validation
 * Protects against XSS, injection attacks, and invalid input
 */
export const useInputSanitization = () => {
  const sanitizeEmail = useMemo(() => (email: string): string => {
    if (!email) return '';
    
    // Remove any potentially dangerous characters
    const cleaned = email
      .toLowerCase()
      .trim()
      .replace(/[<>'"]/g, '') // Remove script-dangerous chars
      .replace(/\s+/g, '') // Remove all whitespace
      .slice(0, 254); // RFC 5321 email length limit
    
    return cleaned;
  }, []);

  const sanitizeName = useMemo(() => (name: string): string => {
    if (!name) return '';
    
    // Allow only letters, spaces, hyphens, and apostrophes
    const cleaned = name
      .trim()
      .replace(/[^a-zA-Z\s\-']/g, '')
      .replace(/\s+/g, ' ') // Normalize whitespace
      .slice(0, 50); // Reasonable name length limit
    
    return cleaned;
  }, []);

  const sanitizeManagerId = useMemo(() => (managerId: string): string => {
    if (!managerId) return '';
    
    // Manager IDs should follow MGR-##### pattern
    const cleaned = managerId
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9\-]/g, '')
      .slice(0, 10); // MGR-##### = 9 chars max
    
    return cleaned;
  }, []);

  const validateEmail = useMemo(() => (email: string): boolean => {
    if (!email) return false;
    
    // Enhanced email validation regex
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    
    // Additional security checks
    const hasValidLength = email.length >= 5 && email.length <= 254;
    const hasValidFormat = emailRegex.test(email);
    const hasValidDomain = email.includes('.') && !email.endsWith('.');
    const noConsecutiveDots = !email.includes('..');
    const noStartEndSpecial = !email.startsWith('.') && !email.startsWith('@') && !email.endsWith('@');
    
    return hasValidLength && hasValidFormat && hasValidDomain && noConsecutiveDots && noStartEndSpecial;
  }, []);

  const validatePassword = useMemo(() => (password: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    if (!password) {
      errors.push('Password is required');
      return { isValid: false, errors };
    }
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (password.length > 128) {
      errors.push('Password must be less than 128 characters');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      errors.push('Password must contain at least one special character');
    }
    
    // Check for common weak patterns
    const commonPatterns = [
      /123456/,
      /password/i,
      /qwerty/i,
      /admin/i,
      /letmein/i
    ];
    
    if (commonPatterns.some(pattern => pattern.test(password))) {
      errors.push('Password contains common weak patterns');
    }
    
    return { isValid: errors.length === 0, errors };
  }, []);

  const validateManagerId = useMemo(() => (managerId: string): boolean => {
    if (!managerId) return false;
    
    // Manager ID should be exactly MGR-##### format
    const managerIdRegex = /^MGR-[0-9]{5}$/;
    return managerIdRegex.test(managerId);
  }, []);

  const sanitizeGenericInput = useMemo(() => (input: string, maxLength: number = 255): string => {
    if (!input) return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove basic XSS vectors
      .slice(0, maxLength);
  }, []);

  return {
    sanitizeEmail,
    sanitizeName,
    sanitizeManagerId,
    sanitizeGenericInput,
    validateEmail,
    validatePassword,
    validateManagerId
  };
};
