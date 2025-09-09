import { useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AuthError {
  type: 'redirect' | 'session' | 'token' | 'network';
  message: string;
  timestamp: number;
}

export const useAuthErrorMonitor = () => {
  const { toast } = useToast();
  const [authErrors, setAuthErrors] = useState<AuthError[]>([]);

  useEffect(() => {
    // Monitor URL for auth error parameters
    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get('error');
    const errorDescription = urlParams.get('error_description');
    
    if (error) {
      const errorMessage = errorDescription || error;
      console.error('🔐 Auth URL Error:', errorMessage);
      
      // Show user-friendly error messages
      let friendlyMessage = '';
      if (error === 'access_denied') {
        friendlyMessage = 'Access was denied. Please try again or contact support if this continues.';
      } else if (error === 'invalid_request' || errorMessage.includes('invalid')) {
        friendlyMessage = 'Invalid authentication request. Please try signing in again.';
      } else if (errorMessage.includes('expired')) {
        friendlyMessage = 'Your authentication link has expired. Please request a new one.';
      } else {
        friendlyMessage = `Authentication error: ${errorMessage}`;
      }
      
      toast({
        title: "Authentication Error",
        description: friendlyMessage,
        variant: "destructive",
      });
      
      // Log the error
      setAuthErrors(prev => [...prev, {
        type: 'redirect',
        message: errorMessage,
        timestamp: Date.now()
      }]);
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
    
    // Monitor for session errors
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' && !session) {
          // Check if this was an unexpected signout
          const wasSignedIn = localStorage.getItem('supabase.auth.token');
          if (wasSignedIn) {
            console.warn('🔐 Unexpected sign out detected');
            setAuthErrors(prev => [...prev, {
              type: 'session',
              message: 'Session expired or was invalidated',
              timestamp: Date.now()
            }]);
          }
        }
        
        if (event === 'TOKEN_REFRESHED' && !session) {
          console.error('🔐 Token refresh failed');
          setAuthErrors(prev => [...prev, {
            type: 'token',
            message: 'Token refresh failed',
            timestamp: Date.now()
          }]);
          
          toast({
            title: "Session Issue",
            description: "Your session has expired. Please sign in again.",
            variant: "destructive",
          });
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, [toast]);

  // Monitor network errors
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message.includes('auth') || event.message.includes('supabase')) {
        console.error('🔐 Auth Network Error:', event.error);
        setAuthErrors(prev => [...prev, {
          type: 'network',
          message: event.message,
          timestamp: Date.now()
        }]);
      }
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  const clearErrors = () => setAuthErrors([]);

  return {
    authErrors,
    clearErrors,
    hasRecentErrors: authErrors.some(error => Date.now() - error.timestamp < 60000) // Last 1 minute
  };
};