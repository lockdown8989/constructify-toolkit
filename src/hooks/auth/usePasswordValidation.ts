
import { useState, useEffect } from 'react';

export interface PasswordStrength {
  score: number; // 0-4
  feedback: string[];
  isValid: boolean;
}

export const usePasswordValidation = (password: string) => {
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    feedback: [],
    isValid: false
  });

  useEffect(() => {
    const validatePassword = (pwd: string): PasswordStrength => {
      const feedback: string[] = [];
      let score = 0;

      // Minimum length check
      if (pwd.length < 8) {
        feedback.push('Password must be at least 8 characters long');
      } else {
        score += 1;
      }

      // Uppercase check
      if (!/[A-Z]/.test(pwd)) {
        feedback.push('Add at least one uppercase letter');
      } else {
        score += 1;
      }

      // Lowercase check
      if (!/[a-z]/.test(pwd)) {
        feedback.push('Add at least one lowercase letter');
      } else {
        score += 1;
      }

      // Number check
      if (!/\d/.test(pwd)) {
        feedback.push('Add at least one number');
      } else {
        score += 1;
      }

      // Special character check
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
        feedback.push('Add at least one special character');
      } else {
        score += 1;
      }

      // Common password patterns
      const commonPatterns = ['password', '123456', 'qwerty', 'admin'];
      if (commonPatterns.some(pattern => pwd.toLowerCase().includes(pattern))) {
        feedback.push('Avoid common password patterns');
        score = Math.max(0, score - 1);
      }

      const isValid = score >= 4 && pwd.length >= 8;

      return { score, feedback, isValid };
    };

    setStrength(validatePassword(password));
  }, [password]);

  return strength;
};
