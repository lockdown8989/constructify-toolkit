
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
      timestamp: new Date().toISOString()
    });
  }, [user, session, isLoading]);

  // Monitor for potential issues
  useEffect(() => {
    if (user && !session) {
      console.warn('⚠️ Auth Warning: User exists but no session');
    }
    
    if (session && !user) {
      console.warn('⚠️ Auth Warning: Session exists but no user');
    }
    
    if (session?.expires_at && session.expires_at * 1000 < Date.now()) {
      console.warn('⚠️ Auth Warning: Session appears to be expired');
    }
  }, [user, session]);
};
