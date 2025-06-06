
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

export const useSecureSession = () => {
  const [lastActivity, setLastActivity] = useState(Date.now());
  
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  const WARNING_TIME = 5 * 60 * 1000; // 5 minutes before timeout

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    let warningId: NodeJS.Timeout;

    const resetTimer = () => {
      setLastActivity(Date.now());
      
      // Clear existing timers
      if (timeoutId) clearTimeout(timeoutId);
      if (warningId) clearTimeout(warningId);
      
      // Set warning timer
      warningId = setTimeout(() => {
        console.warn('Session will expire in 5 minutes due to inactivity');
      }, SESSION_TIMEOUT - WARNING_TIME);
      
      // Set logout timer
      timeoutId = setTimeout(async () => {
        console.log('Session expired due to inactivity');
        await supabase.auth.signOut();
      }, SESSION_TIMEOUT);
    };

    // Activity listeners
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    
    const handleActivity = () => {
      resetTimer();
    };

    // Add event listeners
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    // Initial timer setup
    resetTimer();

    // Cleanup
    return () => {
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      if (timeoutId) clearTimeout(timeoutId);
      if (warningId) clearTimeout(warningId);
    };
  }, []);

  const extendSession = () => {
    setLastActivity(Date.now());
  };

  const getTimeUntilExpiry = () => {
    const elapsed = Date.now() - lastActivity;
    return Math.max(0, SESSION_TIMEOUT - elapsed);
  };

  return {
    extendSession,
    timeUntilExpiry: getTimeUntilExpiry(),
    isNearExpiry: getTimeUntilExpiry() <= WARNING_TIME
  };
};
