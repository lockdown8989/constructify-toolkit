
import { useMemo } from 'react';

export const useInputSanitization = () => {
  return useMemo(() => ({
    sanitizeEmail: (email: string): string => {
      return email.trim().toLowerCase().replace(/[^\w@.-]/g, '');
    },

    sanitizeText: (text: string): string => {
      // Remove potentially dangerous characters while preserving normal text
      return text.trim().replace(/[<>\"'&]/g, '');
    },

    sanitizeName: (name: string): string => {
      // Allow letters, spaces, hyphens, apostrophes
      return name.trim().replace(/[^a-zA-Z\s\-']/g, '');
    },

    validateEmail: (email: string): boolean => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(email) && email.length <= 254;
    },

    validatePassword: (password: string): boolean => {
      return password.length >= 8 && 
             /[A-Z]/.test(password) && 
             /[a-z]/.test(password) && 
             /\d/.test(password) && 
             /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
    },

    escapeHtml: (unsafe: string): string => {
      return unsafe
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }
  }), []);
};
