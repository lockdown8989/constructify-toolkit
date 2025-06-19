
import { useState, useEffect, useCallback } from 'react';

interface AuthAttempt {
  timestamp: number;
  type: 'signin' | 'signup';
}

/**
 * Enhanced authentication rate limiting hook
 * Protects against brute force attacks with exponential backoff
 */
export const useAuthLimiting = () => {
  const [attempts, setAttempts] = useState<AuthAttempt[]>([]);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockUntil, setBlockUntil] = useState<number | null>(null);

  // Configuration
  const MAX_ATTEMPTS = 5;
  const INITIAL_BLOCK_TIME = 5 * 60 * 1000; // 5 minutes
  const MAX_BLOCK_TIME = 60 * 60 * 1000; // 1 hour
  const ATTEMPT_WINDOW = 15 * 60 * 1000; // 15 minutes

  // Load attempts from localStorage on mount
  useEffect(() => {
    const storedAttempts = localStorage.getItem('auth_attempts');
    const storedBlockUntil = localStorage.getItem('auth_block_until');
    
    if (storedAttempts) {
      try {
        const parsedAttempts = JSON.parse(storedAttempts);
        setAttempts(parsedAttempts);
      } catch (error) {
        console.error('Error parsing stored auth attempts:', error);
        localStorage.removeItem('auth_attempts');
      }
    }
    
    if (storedBlockUntil) {
      const blockTime = parseInt(storedBlockUntil, 10);
      if (blockTime > Date.now()) {
        setBlockUntil(blockTime);
        setIsBlocked(true);
      } else {
        localStorage.removeItem('auth_block_until');
      }
    }
  }, []);

  // Check if currently blocked
  useEffect(() => {
    if (blockUntil && blockUntil > Date.now()) {
      setIsBlocked(true);
      const timer = setTimeout(() => {
        setIsBlocked(false);
        setBlockUntil(null);
        localStorage.removeItem('auth_block_until');
      }, blockUntil - Date.now());
      
      return () => clearTimeout(timer);
    } else {
      setIsBlocked(false);
      setBlockUntil(null);
    }
  }, [blockUntil]);

  // Clean old attempts
  const cleanOldAttempts = useCallback(() => {
    const now = Date.now();
    const recentAttempts = attempts.filter(
      attempt => now - attempt.timestamp < ATTEMPT_WINDOW
    );
    
    if (recentAttempts.length !== attempts.length) {
      setAttempts(recentAttempts);
      localStorage.setItem('auth_attempts', JSON.stringify(recentAttempts));
    }
  }, [attempts, ATTEMPT_WINDOW]);

  useEffect(() => {
    cleanOldAttempts();
  }, [cleanOldAttempts]);

  const recordFailedAttempt = useCallback((type: 'signin' | 'signup' = 'signin') => {
    const now = Date.now();
    const newAttempt: AuthAttempt = { timestamp: now, type };
    
    const updatedAttempts = [...attempts, newAttempt].filter(
      attempt => now - attempt.timestamp < ATTEMPT_WINDOW
    );
    
    setAttempts(updatedAttempts);
    localStorage.setItem('auth_attempts', JSON.stringify(updatedAttempts));
    
    // Check if we need to block
    if (updatedAttempts.length >= MAX_ATTEMPTS) {
      // Calculate block time with exponential backoff
      const previousBlocks = Math.floor(updatedAttempts.length / MAX_ATTEMPTS) - 1;
      const blockTime = Math.min(
        INITIAL_BLOCK_TIME * Math.pow(2, previousBlocks),
        MAX_BLOCK_TIME
      );
      
      const blockUntilTime = now + blockTime;
      setBlockUntil(blockUntilTime);
      setIsBlocked(true);
      localStorage.setItem('auth_block_until', blockUntilTime.toString());
      
      console.warn(`Authentication blocked for ${blockTime / 1000} seconds due to too many failed attempts`);
    }
  }, [attempts, MAX_ATTEMPTS, INITIAL_BLOCK_TIME, MAX_BLOCK_TIME, ATTEMPT_WINDOW]);

  const recordSuccessfulAuth = useCallback(() => {
    // Clear all attempts and blocks on successful authentication
    setAttempts([]);
    setIsBlocked(false);
    setBlockUntil(null);
    localStorage.removeItem('auth_attempts');
    localStorage.removeItem('auth_block_until');
  }, []);

  const canAttempt = !isBlocked;
  const attemptsRemaining = Math.max(0, MAX_ATTEMPTS - attempts.length);
  const remainingBlockTime = blockUntil ? Math.max(0, blockUntil - Date.now()) : 0;

  return {
    canAttempt,
    attemptsRemaining,
    remainingBlockTime: Math.ceil(remainingBlockTime / 1000), // Return in seconds
    recordFailedAttempt,
    recordSuccessfulAuth,
    isBlocked,
    recentAttempts: attempts.length
  };
};
