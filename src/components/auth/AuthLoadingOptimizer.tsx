import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useAuthErrorMonitor } from '@/hooks/auth/useAuthErrorMonitor';

interface AuthLoadingOptimizerProps {
  children: React.ReactNode;
}

export const AuthLoadingOptimizer: React.FC<AuthLoadingOptimizerProps> = ({ children }) => {
  const { isLoading, user, rolesLoaded } = useAuth();
  const { hasRecentErrors } = useAuthErrorMonitor();

  // Optimize auth loading by detecting stuck states
  useEffect(() => {
    // If auth has been loading for more than 10 seconds, something is wrong
    const timer = setTimeout(() => {
      if (isLoading && !user) {
        console.warn('🚨 Auth loading timeout detected - forcing reload');
        window.location.reload();
      }
    }, 10000);

    return () => clearTimeout(timer);
  }, [isLoading, user]);

  // Monitor for auth errors that might cause infinite loading
  useEffect(() => {
    if (hasRecentErrors) {
      console.warn('🚨 Recent auth errors detected');
    }
  }, [hasRecentErrors]);

  return <>{children}</>;
};