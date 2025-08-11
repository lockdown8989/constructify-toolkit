
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AuthContextType, UserRole } from './types';
import { useAuthActions } from './useAuthActions';
import { useRoles } from './useRoles';
import { useAuthDebugger } from './useAuthDebugger';
import { SessionTimeoutWarning } from '@/components/auth/SessionTimeoutWarning';
import { ErrorBoundary } from '@/components/auth/ErrorBoundary';
import { toast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Use the roles hook
  const { isAdmin, isHR, isManager, isPayroll, rolesLoaded } = useRoles(user);
  
  // Employee is anyone who is authenticated but doesn't have other roles - FIXED LOGIC
  const isEmployee = !!user && !isAdmin && !isHR && !isManager && !isPayroll;

  // Subscription state (org-level)
  const [subscribed, setSubscribed] = useState<boolean | undefined>(undefined);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);
  const [subscriptionIsTrial, setSubscriptionIsTrial] = useState<boolean>(false);
  const [subscriptionTrialEnd, setSubscriptionTrialEnd] = useState<string | null>(null);
  const subscriptionChannelRef = useRef<any>(null);
  console.log("🔐 AuthProvider roles state:", {
    isAdmin,
    isHR, 
    isManager,
    isPayroll,
    isEmployee,
    rolesLoaded,
    userEmail: user?.email
  });

  // Use auth actions hook
  const authActions = useAuthActions();

// Add debugging hook
useAuthDebugger({ user, session, isLoading });

// Refresh org subscription status
const refreshSubscription = async () => {
  try {
    console.log('🔄 Starting subscription refresh...');
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      console.warn('❌ No active session for subscription check');
      setSubscribed(false);
      return;
    }

    // 1) Primary: invoke edge function via supabase client
    let data: any | null = null;
    let invokeError: any | null = null;
    try {
      const resp = await supabase.functions.invoke('check-subscription', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      data = resp.data;
      invokeError = resp.error ?? null;
    } catch (err) {
      invokeError = err;
    }

    // 2) Fallback: direct fetch to edge function URL (handles rare invoke routing issues)
    if ((!data || invokeError) && typeof fetch !== 'undefined') {
      console.warn('⚠️ Falling back to direct fetch for check-subscription...', invokeError?.message || invokeError);
      try {
        const resp = await fetch('https://fphmujxruswmvlwceodl.supabase.co/functions/v1/check-subscription', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwaG11anhydXN3bXZsd2Nlb2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMDc5NjcsImV4cCI6MjA1Nzc4Mzk2N30.NCTLZVRuiaEopQi0uWdEFn_7noYoEnTvF2CqqD7S-y4',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({}),
        });
        if (resp.ok) {
          data = await resp.json();
        } else {
          console.error('❌ Direct fetch failed for check-subscription', resp.status);
        }
      } catch (err) {
        console.error('❌ Direct fetch exception for check-subscription', err);
      }
    }

    // 3) Last-resort fallback: read from subscribers table if available
    if (!data) {
      try {
        const { data: subRow } = await supabase
          .from('subscribers')
          .select('subscribed, subscription_tier, subscription_end, subscription_is_trial, subscription_trial_end')
          .maybeSingle();
        if (subRow) data = subRow as any;
      } catch {}
    }

    if (!data) throw new Error('No subscription data received');

    console.log('✅ Subscription data received:', data);
    const wasTrial = subscriptionIsTrial;
    const nowSubscribed = !!data?.subscribed;
    const nowIsTrial = !!data?.subscription_is_trial;

    // Normalize Stripe tier to app plan keys
    const normalizedTier = (() => {
      const t = (data?.subscription_tier as string | null)?.toLowerCase();
      if (!t) return null;
      if (t === 'premium' || t === 'pro') return 'pro';
      if (t === 'enterprise' || t === 'custom') return 'custom';
      return t;
    })();

    setSubscribed(nowSubscribed);
    setSubscriptionTier(normalizedTier);
    setSubscriptionEnd(data?.subscription_end ?? null);
    setSubscriptionIsTrial(nowIsTrial);
    setSubscriptionTrialEnd(data?.subscription_trial_end ?? null);
    if (wasTrial && !nowIsTrial && nowSubscribed) {
      toast({ description: 'Your free trial has ended. Your current plan has started.' });
    }

    // Cross-tab subscription sync: notify other tabs/windows
    try { localStorage.setItem('subscription-updated', String(Date.now())); } catch {}
    try { const bc = new BroadcastChannel('subscription'); bc.postMessage({ type: 'updated' }); bc.close(); } catch {}
    // Realtime broadcast to other connected users
    try { subscriptionChannelRef.current?.send({ type: 'broadcast', event: 'updated', payload: { ts: Date.now(), subscribed: nowSubscribed, tier: normalizedTier } }); } catch {}
  } catch (e) {
    console.error('❌ Subscription check failed:', e);
    setSubscribed(false);
    setSubscriptionTier(null);
    setSubscriptionEnd(null);
  }
};

  useEffect(() => {
    let mounted = true;
    console.log('🔄 AuthProvider: Setting up auth state listener');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (!mounted) return;
        
        console.log('🔐 Auth state change event:', {
          event,
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          timestamp: new Date().toISOString(),
          sessionExpires: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
        });
        
        // Update state for all events, but preserve existing session if new session is null
        // unless it's an explicit SIGNED_OUT event
        if (event === 'SIGNED_OUT') {
          console.log('🔄 Explicit sign out - clearing session');
          setSession(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // Handle token refresh - always update if we get a new session
        if (event === 'TOKEN_REFRESHED' && session) {
          console.log('🔄 Token refreshed successfully');
          setSession(session);
          setUser(session.user);
          setIsLoading(false);
          return;
        }
        
        // Handle other events that shouldn't clear session
        if (event === 'PASSWORD_RECOVERY' || event === 'USER_UPDATED') {
          console.log('🔄 Password recovery or user update event - maintaining existing session');
          return;
        }
        
        // For INITIAL_SESSION and SIGNED_IN events - only update if we have a session
if ((event === 'INITIAL_SESSION' || event === 'SIGNED_IN') && session) {
  console.log(`🔄 ${event} event - updating session state`);
  setSession(session);
  setUser(session.user);
  setIsLoading(false);
  // Defer subscription check to avoid deadlocks
  setTimeout(() => { refreshSubscription(); }, 0);
  return;
}
        
        // For INITIAL_SESSION with no session, only clear if we don't already have a session
        if (event === 'INITIAL_SESSION' && !session) {
          console.log('🔄 Initial session check - no session found');
          setSession(null);
          setUser(null);
          setIsLoading(false);
          return;
        }
        
        // For any other events with valid session, update state
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          setIsLoading(false);
        }
      }
    );

    // THEN check for existing session
    console.log('🔄 AuthProvider: Checking for existing session');
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (!mounted) return;
        
        if (error) {
          console.error('Error getting session:', error);
          setSession(null);
          setUser(null);
          setIsLoading(false);
          return;
        }

        console.log('📋 Initial session check:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          timestamp: new Date().toISOString(),
          sessionExpires: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : null
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      })
      .catch((error) => {
        if (!mounted) return;
        console.error('💥 Exception in getSession:', error);
        setSession(null);
        setUser(null);
        setIsLoading(false);
      });

    return () => {
      mounted = false;
      console.log('🔄 AuthProvider: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Update loading state - ensure auth persists regardless of role loading
  useEffect(() => {
    // If we have a user, they should stay authenticated regardless of role loading status
    if (user) {
      console.log('📝 User authenticated, setting loading to false regardless of roles');
      setIsLoading(false);
    } else if (!user) {
      console.log('📝 No user, setting loading to false');
      setIsLoading(false);
    }
  }, [user]);

  // Handle Stripe checkout return globally
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const status = params.get('status');
    if (status === 'success') {
      toast({ description: 'Payment successful! Updating subscription...' });
      // Immediate refresh + short polling to handle Stripe processing latency
      refreshSubscription();
      let attempts = 0;
      const maxAttempts = 6; // ~12s total
      const interval = setInterval(() => {
        attempts += 1;
        refreshSubscription();
        if (attempts >= maxAttempts) clearInterval(interval);
      }, 2000);
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'canceled') {
      toast({ description: 'Payment canceled.' });
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Listen for subscription updates from other tabs/windows
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'subscription-updated') {
        refreshSubscription();
      }
    };
    window.addEventListener('storage', onStorage);
    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('subscription');
      bc.onmessage = () => refreshSubscription();
    } catch {}
    return () => {
      window.removeEventListener('storage', onStorage);
      try { bc?.close(); } catch {}
    };
  }, []);

  // Realtime listener for subscription updates from other users
  useEffect(() => {
    const channel = supabase
      .channel('subscription_broadcast', { config: { broadcast: { self: false } } })
      .on('broadcast', { event: 'updated' }, () => {
        // When any client broadcasts a subscription update, re-check status
        refreshSubscription();
      });

    const subscribe = async () => {
      try {
        const status = await channel.subscribe();
        console.log('📡 Subscription broadcast channel status:', status);
        subscriptionChannelRef.current = channel;
      } catch (err) {
        console.warn('⚠️ Failed to subscribe to subscription broadcast channel', err);
      }
    };
    subscribe();

    return () => {
      try { if (subscriptionChannelRef.current) supabase.removeChannel(subscriptionChannelRef.current); } catch {}
      subscriptionChannelRef.current = null;
    };
  }, []);

const value: AuthContextType = {
  user,
  session,
  isLoading,
  isAdmin,
  isHR,
  isManager,
  isEmployee,
  isPayroll,
  rolesLoaded,
  isAuthenticated: !!session?.user,
  // Subscription
  subscribed,
  subscriptionTier,
  subscriptionEnd,
  subscriptionIsTrial,
  subscriptionTrialEnd,
  refreshSubscription,
  ...authActions, // This includes signIn, signUp, resetPassword, updatePassword, signOut, deleteAccount
};

  return (
    <ErrorBoundary>
      <AuthContext.Provider value={value}>
        {children}
        {session?.user && <SessionTimeoutWarning />}
      </AuthContext.Provider>
    </ErrorBoundary>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const isAuthenticated = () => {
  const { user } = useAuth();
  return !!user;
};

export type { UserRole };
