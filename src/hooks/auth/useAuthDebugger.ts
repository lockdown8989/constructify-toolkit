
import { useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthDebugProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export const useAuthDebugger = ({ user, session, isLoading }: AuthDebugProps) => {
  useEffect(() => {
    console.log('🔍 Auth Debug State:', {
      hasUser: !!user,
      hasSession: !!session,
      isLoading,
      userId: user?.id,
      userEmail: user?.email,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000) : null,
      sessionValid: session?.expires_at ? (session.expires_at * 1000 > Date.now()) : null,
      timestamp: new Date().toISOString(),
      timeSinceExpiry: session?.expires_at ? (Date.now() - (session.expires_at * 1000)) : null
    });
  }, [user, session, isLoading]);

  // Monitor for potential issues with detailed logging
  useEffect(() => {
    if (user && !session) {
      console.warn('⚠️ Auth Warning: User exists but no session - possible session loss');
    }
    
    if (session && !user) {
      console.warn('⚠️ Auth Warning: Session exists but no user - inconsistent state');
    }
    
    if (session?.expires_at && session.expires_at * 1000 < Date.now()) {
      const timeSinceExpiry = Date.now() - (session.expires_at * 1000);
      console.warn('⚠️ Auth Warning: Session expired', {
        expiredAt: new Date(session.expires_at * 1000),
        timeSinceExpiry: `${Math.round(timeSinceExpiry / 1000)}s ago`
      });
    }
  }, [user, session]);

  // Track auth state transitions
  useEffect(() => {
    const authState = user ? 'authenticated' : 'unauthenticated';
    const loadingState = isLoading ? 'loading' : 'loaded';
    console.log(`🔄 Auth State Transition: ${authState} & ${loadingState}`, {
      timestamp: new Date().toISOString()
    });
  }, [user, isLoading]);
};
