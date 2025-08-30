import { useCallback } from 'react';

export const useInputSanitization = () => {
  // Sanitize general text input to prevent XSS
  const sanitizeText = useCallback((input: string): string => {
    if (typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove basic HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: protocols
      .replace(/on\w+=/gi, '') // Remove event handlers
      .slice(0, 5000); // Limit length
  }, []);

  // Sanitize email input
  const sanitizeEmail = useCallback((email: string): string => {
    if (typeof email !== 'string') return '';
    
    return email
      .trim()
      .toLowerCase()
      .replace(/[<>"'&]/g, '') // Remove problematic characters
      .slice(0, 254); // RFC 5321 limit
  }, []);

  // Sanitize name input (more permissive than general text)
  const sanitizeName = useCallback((name: string): string => {
    if (typeof name !== 'string') return '';
    
    return name
      .trim()
      .replace(/[<>]/g, '') // Remove basic HTML tags
      .replace(/[^\w\s\-\.]/g, '') // Only allow word chars, spaces, hyphens, periods
      .slice(0, 100); // Reasonable name length limit
  }, []);

  // Sanitize numeric input
  const sanitizeNumber = useCallback((input: string | number): number => {
    if (typeof input === 'number') return Math.max(0, input);
    if (typeof input !== 'string') return 0;
    
    const cleaned = input.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.max(0, parsed);
  }, []);

  // Sanitize phone number
  const sanitizePhone = useCallback((phone: string): string => {
    if (typeof phone !== 'string') return '';
    
    return phone
      .replace(/[^\d\+\-\(\)\s]/g, '') // Only allow digits and phone formatting chars
      .slice(0, 20); // Reasonable phone length
  }, []);

  return {
    sanitizeText,
    sanitizeEmail,
    sanitizeName,
    sanitizeNumber,
    sanitizePhone
  };
};