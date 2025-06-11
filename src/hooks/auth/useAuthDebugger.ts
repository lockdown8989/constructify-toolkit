
import { useEffect, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthDebuggerProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export const useAuthDebugger = ({ user, session, isLoading }: AuthDebuggerProps) => {
  const previousState = useRef<AuthDebuggerProps>({ user: null, session: null, isLoading: true });
  const authEventCount = useRef(0);

  useEffect(() => {
    const current = { user, session, isLoading };
    const previous = previousState.current;
    
    // Log any auth state changes
    if (
      previous.user !== current.user ||
      previous.session !== current.session ||
      previous.isLoading !== current.isLoading
    ) {
      authEventCount.current++;
      
      console.group(`🔐 Auth State Change #${authEventCount.current}`);
      console.log('Timestamp:', new Date().toISOString());
      console.log('Previous state:', {
        hasUser: !!previous.user,
        hasSession: !!previous.session,
        userId: previous.user?.id,
        sessionId: previous.session?.access_token?.slice(0, 10) + '...',
        isLoading: previous.isLoading
      });
      console.log('Current state:', {
        hasUser: !!current.user,
        hasSession: !!current.session,
        userId: current.user?.id,
        sessionId: current.session?.access_token?.slice(0, 10) + '...',
        isLoading: current.isLoading
      });
      
      // Log specific transition types
      if (previous.user && !current.user) {
        console.warn('🚨 USER LOGOUT DETECTED');
        console.trace('Logout stack trace');
      }
      
      if (!previous.user && current.user) {
        console.log('✅ USER LOGIN DETECTED');
      }
      
      if (previous.session && !current.session) {
        console.warn('🚨 SESSION LOST');
      }
      
      // Log window/document focus state
      console.log('Document state:', {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
        hasFocus: document.hasFocus()
      });
      
      // Log current URL and any iframe context
      console.log('Location info:', {
        href: window.location.href,
        origin: window.location.origin,
        inIframe: window !== window.top,
        parentOrigin: window !== window.top ? 'iframe detected' : 'not in iframe'
      });
      
      console.groupEnd();
    }
    
    // Update previous state
    previousState.current = current;
  }, [user, session, isLoading]);

  // Listen for visibility changes that might affect auth
  useEffect(() => {
    const handleVisibilityChange = () => {
      console.log('👁️ Visibility changed:', {
        hidden: document.hidden,
        visibilityState: document.visibilityState,
        timestamp: new Date().toISOString()
      });
    };

    const handleFocusChange = () => {
      console.log('🎯 Focus changed:', {
        type: 'focus',
        hasFocus: document.hasFocus(),
        timestamp: new Date().toISOString()
      });
    };

    const handleBlurChange = () => {
      console.log('🎯 Focus changed:', {
        type: 'blur',
        hasFocus: document.hasFocus(),
        timestamp: new Date().toISOString()
      });
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocusChange);
    window.addEventListener('blur', handleBlurChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocusChange);
      window.removeEventListener('blur', handleBlurChange);
    };
  }, []);

  // Log external iframe interactions
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log('📨 Iframe message received:', {
        origin: event.origin,
        data: event.data,
        timestamp: new Date().toISOString(),
        currentAuthState: {
          hasUser: !!user,
          hasSession: !!session
        }
      });
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [user, session]);
};
