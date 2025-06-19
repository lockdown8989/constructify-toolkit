/**
 * Hook for input sanitization and validation
 */
export const useInputSanitization = () => {
  const sanitizeEmail = (email: string): string => {
    return email.trim().toLowerCase();
  };

  const sanitizeName = (name: string): string => {
    // Remove any potentially harmful characters but keep spaces and common name characters
    return name.replace(/[<>"/\\&]/g, '').trim();
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  return {
    sanitizeEmail,
    sanitizeName,
    validateEmail
  };
};
