
import { useState, useEffect } from 'react';

const MAX_ATTEMPTS = 5;
const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds

interface AuthAttempt {
  timestamp: number;
  success: boolean;
}

/**
 * Hook to handle authentication rate limiting
 */
export const useAuthLimiting = () => {
  const [attempts, setAttempts] = useState<AuthAttempt[]>([]);
  const [canAttempt, setCanAttempt] = useState(true);
  const [attemptsRemaining, setAttemptsRemaining] = useState(MAX_ATTEMPTS);
  const [remainingBlockTime, setRemainingBlockTime] = useState(0);

  useEffect(() => {
    const now = Date.now();
    const recentAttempts = attempts.filter(attempt => 
      now - attempt.timestamp < BLOCK_DURATION
    );

    const failedAttempts = recentAttempts.filter(attempt => !attempt.success);
    
    if (failedAttempts.length >= MAX_ATTEMPTS) {
      const oldestFailedAttempt = failedAttempts[0];
      const timeUntilUnblock = BLOCK_DURATION - (now - oldestFailedAttempt.timestamp);
      
      if (timeUntilUnblock > 0) {
        setCanAttempt(false);
        setRemainingBlockTime(Math.ceil(timeUntilUnblock / 1000));
        setAttemptsRemaining(0);
        
        const timer = setTimeout(() => {
          setCanAttempt(true);
          setRemainingBlockTime(0);
          setAttemptsRemaining(MAX_ATTEMPTS);
        }, timeUntilUnblock);
        
        return () => clearTimeout(timer);
      }
    }

    setCanAttempt(true);
    setAttemptsRemaining(MAX_ATTEMPTS - failedAttempts.length);
    setRemainingBlockTime(0);
  }, [attempts]);

  const recordFailedAttempt = () => {
    setAttempts(prev => [...prev, { timestamp: Date.now(), success: false }]);
  };

  const recordSuccessfulAuth = () => {
    setAttempts(prev => [...prev, { timestamp: Date.now(), success: true }]);
  };

  return {
    canAttempt,
    attemptsRemaining,
    remainingBlockTime,
    recordFailedAttempt,
    recordSuccessfulAuth
  };
};
