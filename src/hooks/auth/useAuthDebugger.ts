
import { useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthDebuggerProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

/**
 * Auth debugger hook for development - helps track authentication state changes
 * Should be disabled in production
 */
export const useAuthDebugger = ({ user, session, isLoading }: AuthDebuggerProps) => {
  useEffect(() => {
    // Only log in development
    if (process.env.NODE_ENV !== 'development') return;

    console.group('🔐 Auth State Debug');
    console.log('User:', user ? {
      id: user.id,
      email: user.email,
      emailConfirmed: user.email_confirmed_at,
      lastSignIn: user.last_sign_in_at,
      createdAt: user.created_at
    } : null);
    console.log('Session:', session ? {
      accessToken: session.access_token ? '***present***' : null,
      refreshToken: session.refresh_token ? '***present***' : null,
      expiresAt: session.expires_at,
      expiresIn: session.expires_in
    } : null);
    console.log('Loading:', isLoading);
    console.groupEnd();
  }, [user, session, isLoading]);

  // Security monitoring in production
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') {
      // Log security-relevant events for monitoring
      if (user && !session) {
        console.warn('⚠️ Security Alert: User present but no session');
      }
      
      if (session && !user) {
        console.warn('⚠️ Security Alert: Session present but no user');
      }
    }
  }, [user, session]);
};
