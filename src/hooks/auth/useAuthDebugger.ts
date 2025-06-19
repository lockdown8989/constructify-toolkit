
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
    console.log('Auth State:', {
      hasUser: !!user,
      hasSession: !!session,
      isLoading,
      userId: user?.id,
      userEmail: user?.email,
      sessionValid: session?.expires_at ? new Date(session.expires_at * 1000) > new Date() : false,
      timestamp: new Date().toISOString()
    });
    
    if (user) {
      console.log('User Details:', {
        id: user.id,
        email: user.email,
        emailConfirmed: user.email_confirmed_at,
        lastSignIn: user.last_sign_in_at,
        userMetadata: user.user_metadata,
        appMetadata: user.app_metadata
      });
    }
    
    if (session) {
      console.log('Session Details:', {
        accessToken: session.access_token ? 'Present' : 'Missing',
        refreshToken: session.refresh_token ? 'Present' : 'Missing',
        expiresAt: session.expires_at ? new Date(session.expires_at * 1000) : 'No expiry',
        tokenType: session.token_type
      });
    }
    
    console.groupEnd();
  }, [user, session, isLoading]);
};
