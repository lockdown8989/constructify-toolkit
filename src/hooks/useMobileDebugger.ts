
import { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { useLocation, useNavigate } from 'react-router-dom';

export const useMobileDebugger = () => {
  const { user, isLoading, isAuthenticated } = useAuth();
  const isMobile = useIsMobile();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (isMobile) {
      console.group('📱 Mobile Debug Info');
      console.log('Current state:', {
        isAuthenticated,
        hasUser: !!user,
        isLoading,
        currentPath: location.pathname,
        userAgent: navigator.userAgent,
        screenSize: `${window.innerWidth}x${window.innerHeight}`,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
          devicePixelRatio: window.devicePixelRatio
        },
        timestamp: new Date().toISOString()
      });

      // Check for potential mobile issues
      const issues = [];
      
      if (window.innerWidth <= 320) {
        issues.push('Very small screen detected');
      }
      
      if (navigator.userAgent.includes('iPhone') && window.innerHeight < 500) {
        issues.push('Possible iPhone viewport issue');
      }
      
      if (window.devicePixelRatio > 2) {
        issues.push('High DPI display detected');
      }
      
      if (issues.length > 0) {
        console.warn('🚨 Potential mobile issues:', issues);
      }
      
      console.groupEnd();
    }
  }, [user, isLoading, isAuthenticated, location.pathname, isMobile]);

  // Monitor for mobile-specific errors
  useEffect(() => {
    if (!isMobile) return;

    const handleError = (event: ErrorEvent) => {
      console.error('📱 Mobile Runtime Error:', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        stack: event.error?.stack,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('📱 Mobile Unhandled Promise Rejection:', {
        reason: event.reason,
        promise: event.promise,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [isMobile]);
};
