
import { useState, useEffect } from 'react';

interface AttemptTracker {
  count: number;
  lastAttempt: number;
  blocked: boolean;
}

export const useAuthLimiting = () => {
  const [attempts, setAttempts] = useState<AttemptTracker>({
    count: 0,
    lastAttempt: 0,
    blocked: false
  });

  const MAX_ATTEMPTS = 5;
  const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes
  const RESET_DURATION = 60 * 60 * 1000; // 1 hour

  useEffect(() => {
    const stored = localStorage.getItem('auth_attempts');
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as AttemptTracker;
        const now = Date.now();
        
        // Reset if enough time has passed
        if (now - parsed.lastAttempt > RESET_DURATION) {
          setAttempts({ count: 0, lastAttempt: 0, blocked: false });
          localStorage.removeItem('auth_attempts');
        } else if (parsed.blocked && now - parsed.lastAttempt > BLOCK_DURATION) {
          // Unblock after block duration
          setAttempts({ ...parsed, blocked: false });
        } else {
          setAttempts(parsed);
        }
      } catch {
        localStorage.removeItem('auth_attempts');
      }
    }
  }, []);

  const recordFailedAttempt = () => {
    const now = Date.now();
    const newCount = attempts.count + 1;
    const blocked = newCount >= MAX_ATTEMPTS;
    
    const newAttempts = {
      count: newCount,
      lastAttempt: now,
      blocked
    };
    
    setAttempts(newAttempts);
    localStorage.setItem('auth_attempts', JSON.stringify(newAttempts));
  };

  const recordSuccessfulAuth = () => {
    setAttempts({ count: 0, lastAttempt: 0, blocked: false });
    localStorage.removeItem('auth_attempts');
  };

  const getRemainingBlockTime = (): number => {
    if (!attempts.blocked) return 0;
    const elapsed = Date.now() - attempts.lastAttempt;
    const remaining = BLOCK_DURATION - elapsed;
    return Math.max(0, Math.ceil(remaining / 1000));
  };

  const canAttempt = (): boolean => {
    if (!attempts.blocked) return true;
    return getRemainingBlockTime() === 0;
  };

  return {
    canAttempt: canAttempt(),
    attemptsRemaining: Math.max(0, MAX_ATTEMPTS - attempts.count),
    remainingBlockTime: getRemainingBlockTime(),
    recordFailedAttempt,
    recordSuccessfulAuth,
    isBlocked: attempts.blocked
  };
};
