
export const useInputSanitization = () => {
  const sanitizeText = (input: string): string => {
    if (typeof input !== 'string') return '';
    
    // Basic XSS prevention - remove script tags and dangerous patterns
    const cleaned = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .trim();
    
    return cleaned;
  };

  const sanitizeEmail = (email: string): string => {
    if (typeof email !== 'string') return '';
    
    // Basic email sanitization - remove dangerous characters
    const cleaned = email
      .toLowerCase()
      .trim()
      .replace(/[<>"/';\\]/g, '');
    
    return cleaned;
  };

  const sanitizeName = (name: string): string => {
    if (typeof name !== 'string') return '';
    
    // Allow letters, spaces, hyphens, and periods for names
    const cleaned = name
      .trim()
      .replace(/[^a-zA-Z\s\-\.]/g, '');
    
    return cleaned;
  };

  return {
    sanitizeText,
    sanitizeEmail,
    sanitizeName
  };
};
