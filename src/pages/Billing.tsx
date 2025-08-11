import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, X, ExternalLink, AlertTriangle } from 'lucide-react';
import { useToast, toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';

const plans = [
  {
    id: 'pro',
    name: 'PRO',
    features: ['All features unlocked', 'Advanced scheduling', 'Payroll exports', 'Priority support'],
    monthly: 14.99,
    annual: 149.99,
  },
  {
    id: 'custom',
    name: 'Custom',
    features: ['Pick exactly what you need', 'Per-feature pricing', 'SLA & SSO options'],
    monthly: null,
    annual: null,
  },
] as const;

type Interval = 'month' | 'year';

export default function Billing() {
  const { user, isAdmin, isEmployee, isPayroll, subscribed, subscriptionTier, subscriptionEnd, refreshSubscription } = useAuth();
  const navigate = useNavigate();
  const [interval, setInterval] = useState<Interval>('month');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [customSelections, setCustomSelections] = useState<string[]>([]);
  const currency = 'GBP';

  const currentPlanId = useMemo(() => {
    if (!subscribed) return null;
    const t = subscriptionTier?.toLowerCase();
    if (t === 'premium' || t === 'pro') return 'pro';
    if (t === 'enterprise' || t === 'custom') return 'custom';
    return null;
  }, [subscribed, subscriptionTier]);

  // Handle successful payment redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const plan = urlParams.get('plan');
    
    if (status === 'success' && plan) {
      console.log('🎉 Payment successful, refreshing subscription...');
      toast({ description: 'Payment successful! Your subscription is now active.' });
      // Refresh subscription status after successful payment
      setTimeout(() => {
        refreshSubscription?.();
      }, 1000);
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (status === 'canceled') {
      console.log('❌ Payment canceled');
      toast({ description: 'Payment was canceled. You can try again anytime.' });
      // Clean up URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, [refreshSubscription]);

  useEffect(() => {
    if (isEmployee || isPayroll) {
      navigate('/dashboard', { replace: true });
    }
  }, [isEmployee, isPayroll, navigate]);

  const displayPrice = (value: number | null) => {
    if (value == null) return 'Contact sales';
    return new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(value);
  };

  const handleSubscribe = async (planId: 'pro' | 'custom') => {
    console.log('🎯 handleSubscribe called:', { planId, isAdmin, userEmail: user?.email });
    
    if (planId === 'custom') {
      window.open('#contact', '_self');
      return;
    }
    
    if (!isAdmin) {
      console.warn('❌ User is not admin:', { isAdmin });
      toast({ description: 'Only administrators can start a subscription' });
      return;
    }
    
    setIsLoading(planId);
    try {
      console.log('🔐 Getting session...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session?.access_token) {
        console.error('❌ No active session');
        throw new Error('No active session');
      }
      
      console.log('✅ Session valid, calling create-checkout...');

      const payload = {
        planTier: planId,
        interval: interval,
        currency: 'gbp',
        successUrl: `${window.location.origin}/billing?status=success&plan=${planId}`,
        cancelUrl: `${window.location.origin}/billing?status=canceled`
      };

      // Primary call via Supabase client
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: payload,
      });

      console.log('📦 create-checkout response:', { data, error });

      let checkoutUrl = data?.url as string | undefined;

      // Fallback: direct fetch to Edge Function if supabase-js invoke fails to reach it
      if (!checkoutUrl) {
        console.warn('⚠️ Falling back to direct fetch for create-checkout...');
        const functionUrl = 'https://fphmujxruswmvlwceodl.supabase.co/functions/v1/create-checkout';
        const resp = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZwaG11anhydXN3bXZsd2Nlb2RsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDIyMDc5NjcsImV4cCI6MjA1Nzc4Mzk2N30.NCTLZVRuiaEopQi0uWdEFn_7noYoEnTvF2CqqD7S-y4',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        });
        if (!resp.ok) {
          const text = await resp.text();
          console.error('❌ Direct fetch failed:', resp.status, text);
          throw new Error(`Checkout failed (${resp.status})`);
        }
        const json = await resp.json();
        checkoutUrl = json?.url;
      }

      if (checkoutUrl) {
        console.log('🚀 Opening checkout URL:', checkoutUrl);
        window.open(checkoutUrl, '_blank');
        toast({ description: 'Redirecting to checkout...' });
      } else {
        console.error('❌ No URL in response');
        throw new Error('No checkout URL received');
      }
    } catch (e: any) {
      console.error('💥 Subscribe error:', e);
      
      // More detailed error messages
      let errorMessage = 'Failed to start checkout';
      if (e.name === 'FunctionsFetchError') {
        errorMessage = 'Cannot connect to payment service. Please check your connection and try again.';
      } else if (e.message?.includes('No active session')) {
        errorMessage = 'Session expired. Please refresh the page and try again.';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      toast({ description: errorMessage });
    } finally {
      setIsLoading(null);
    }
  };

  const handleManage = async () => {
    if (!isAdmin) {
      console.warn('❌ User is not admin:', { isAdmin });
      toast({ description: 'Only administrators can manage subscriptions' });
      return;
    }

    setIsLoading('manage');
    try {
      console.log('🔐 Getting session for manage...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session?.access_token) {
        console.error('❌ No active session');
        throw new Error('No active session');
      }

      console.log('✅ Session valid, calling customer-portal...');
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      console.log('📦 customer-portal response:', { data, error });
      
      if (error) throw error;
      
      if (data?.url) {
        console.log('🚀 Opening customer portal URL:', data.url);
        window.open(data.url, '_blank');
        toast({ description: 'Opening subscription management portal...' });
      } else {
        console.error('❌ No URL in response');
        throw new Error('No portal URL received');
      }
    } catch (e: any) {
      console.error('💥 Portal error:', e);
      toast({ description: e.message || 'Failed to open customer portal' });
    } finally {
      setIsLoading(null);
    }
  };

  const handleCancelSubscription = async () => {
    console.log('🎯 handleCancelSubscription called:', { subscribed, isAdmin });
    
    if (!subscribed) {
      console.warn('❌ No active subscription');
      toast({ description: 'No active subscription to cancel' });
      return;
    }

    if (!isAdmin) {
      console.warn('❌ User is not admin:', { isAdmin });
      toast({ description: 'Only administrators can cancel subscriptions' });
      return;
    }

    setIsLoading('cancel');
    try {
      console.log('🔐 Getting session for cancel...');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('❌ Session error:', sessionError);
        throw new Error(`Session error: ${sessionError.message}`);
      }
      
      if (!session?.access_token) {
        console.error('❌ No active session');
        throw new Error('No active session');
      }

      console.log('✅ Session valid, calling customer-portal for cancellation...');
      
      // Use the customer portal to handle cancellation
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      console.log('📦 customer-portal response for cancel:', { data, error });
      
      if (error) {
        console.error('❌ Customer portal error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('🚀 Opening cancellation portal URL:', data.url);
        toast({ 
          description: 'Opening Stripe portal where you can cancel your subscription...',
          duration: 4000
        });
        window.open(data.url, '_blank');
      } else {
        console.error('❌ No portal URL received');
        throw new Error('No portal URL received');
      }
    } catch (e: any) {
      console.error('💥 Cancel subscription error:', e);
      
      // More detailed error messages
      let errorMessage = 'Failed to open cancellation portal';
      if (e.name === 'FunctionsFetchError') {
        errorMessage = 'Cannot connect to subscription service. Please check your connection and try again.';
      } else if (e.message?.includes('No active session')) {
        errorMessage = 'Session expired. Please refresh the page and try again.';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      toast({ description: errorMessage });
    } finally {
      setIsLoading(null);
    }
  };

  const handleRefresh = async () => {
    setIsLoading('refresh');
    try {
      await refreshSubscription?.();
      toast({ description: 'Subscription status refreshed' });
    } catch (e: any) {
      toast({ description: 'Could not refresh subscription' });
    } finally {
      setIsLoading(null);
    }
  };

  const subtitle = useMemo(() => {
    if (subscribed) {
      const end = subscriptionEnd ? new Date(subscriptionEnd).toLocaleDateString() : '';
      return `Your plan: ${subscriptionTier ?? 'Active'} • Renews ${end}`;
    }
    if (subscribed === false) return 'No active subscription. Access is limited until you subscribe.';
    return 'Choose a plan that fits your team';
  }, [subscribed, subscriptionEnd, subscriptionTier]);

  if (isEmployee || isPayroll) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <Helmet>
        <title>Billing & Subscription | TeamPulse HR</title>
        <meta name="description" content="Manage your TeamPulse HR subscription. PRO and Custom plans for administrators." />
        <link rel="canonical" href={`${window.location.origin}/billing`} />
      </Helmet>

      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground text-sm mt-1">{subtitle}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Label htmlFor="interval">{interval === 'month' ? 'Monthly' : 'Annually'}</Label>
            <Switch id="interval" checked={interval === 'year'} onCheckedChange={(v) => setInterval(v ? 'year' : 'month')} />
          </div>
          <Button variant="secondary" onClick={handleRefresh} disabled={isLoading !== null}>
            Refresh status
          </Button>
        </div>
      </header>

      <main className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} className={p.id === 'pro' ? 'ring-1 ring-primary' : ''}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{p.name}</span>
                {currentPlanId === p.id && (
                  <Badge variant="secondary" className="ml-2">Current plan</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-semibold">
                {p.id === 'custom' ? 'Custom' : displayPrice(interval === 'month' ? p.monthly : p.annual)}
                {p.id !== 'custom' && (
                  <span className="ml-1 text-sm text-muted-foreground">/ {interval}</span>
                )}
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>

              {p.id === 'custom' && (
                <div className="space-y-2">
                  <Label className="text-sm">Select features</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {['Core HR','Attendance tracking','Scheduling','Payroll exports','Priority support','SSO','SLA'].map((opt) => (
                      <label key={opt} className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          className="h-4 w-4 accent-primary"
                          checked={customSelections.includes(opt)}
                          onChange={(e) =>
                            setCustomSelections((prev) =>
                              e.target.checked ? [...prev, opt] : prev.filter((x) => x !== opt)
                            )
                          }
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {p.id === 'custom' ? (
                <Button variant="outline" onClick={() => window.open('#contact', '_self')}>
                  Contact sales
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <>
                  {currentPlanId === p.id ? (
                    <Button className="w-full" variant="secondary" disabled>
                      Current plan
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() => handleSubscribe(p.id)}
                      disabled={isLoading !== null || !isAdmin}
                    >
                      {isLoading === p.id ? (
                        <span className="inline-flex items-center"><Loader2 className="mr-2 h-4 w-4 animate-spin" />Processing...</span>
                      ) : (
                        <span>{isAdmin ? 'Subscribe now' : 'Admin required'}</span>
                      )}
                    </Button>
                  )}
                </>
              )}

              <div className="text-xs text-muted-foreground">
                {p.id !== 'custom' ? 'Cancel anytime. Only the admin is charged; team inherits access.' : 'Let’s tailor features and pricing for your org.'}
              </div>
            </CardContent>
          </Card>
        ))}
      </main>

      <aside className="mt-4 flex flex-col sm:flex-row flex-wrap gap-3">
        <Button variant="outline" onClick={handleManage} disabled={isLoading !== null}>
          {isLoading === 'manage' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Manage subscription
        </Button>
        
        {subscribed && isAdmin && (
          <Button 
            variant="destructive" 
            onClick={handleCancelSubscription} 
            disabled={isLoading !== null}
            className="flex items-center gap-2"
          >
            {isLoading === 'cancel' ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <AlertTriangle className="h-4 w-4" />
            )}
            Cancel Subscription
          </Button>
        )}
        
        {subscribed === false && !isAdmin && (
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <X className="h-4 w-4" /> Your organization needs an active subscription. Ask your admin to subscribe.
          </div>
        )}
      </aside>
    </div>
  );
}
