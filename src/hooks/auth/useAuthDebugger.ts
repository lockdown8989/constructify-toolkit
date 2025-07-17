
import { useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';

interface AuthDebuggerProps {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
}

export const useAuthDebugger = ({ user, session, isLoading }: AuthDebuggerProps) => {
  useEffect(() => {
    console.group('🔐 Auth State Debug');
    console.log('Auth state check:', {
      hasUser: !!user,
      hasSession: !!session,
      isLoading,
      userId: user?.id,
      userEmail: user?.email,
      sessionExpiry: session?.expires_at ? new Date(session.expires_at * 1000) : null,
      timestamp: new Date().toISOString()
    });
    
    if (user) {
      console.log('User metadata:', {
        emailConfirmed: user.email_confirmed_at,
        lastSignIn: user.last_sign_in_at,
        metadata: user.user_metadata,
        appMetadata: user.app_metadata
      });
    }
    
    if (!user && !isLoading) {
      console.warn('❌ No user found - user should be redirected to auth');
    }
    
    console.groupEnd();
  }, [user, session, isLoading]);
};
