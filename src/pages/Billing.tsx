import React, { useMemo, useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, Check, X, ExternalLink } from 'lucide-react';
import { useToast, toast } from '@/hooks/use-toast';

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
  const { user, isAdmin, subscribed, subscriptionTier, subscriptionEnd, refreshSubscription } = useAuth();
  const [interval, setInterval] = useState<Interval>('month');
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [customSelections, setCustomSelections] = useState<string[]>([]);
  const currency = 'GBP';

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
      
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        body: {
          planTier: planId,
          interval: interval,
          currency: 'gbp',
        },
      });
      
      console.log('📦 create-checkout response:', { data, error });
      
      if (error) {
        console.error('❌ Edge function error:', error);
        throw error;
      }
      
      if (data?.url) {
        console.log('🚀 Opening checkout URL:', data.url);
        window.open(data.url, '_blank');
        toast({ description: 'Redirecting to checkout...' });
      } else {
        console.error('❌ No URL in response:', data);
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
    setIsLoading('manage');
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, '_blank');
    } catch (e: any) {
      console.error('Portal error', e);
      toast({ description: e.message || 'Failed to open customer portal' });
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

              <div className="text-xs text-muted-foreground">
                {p.id !== 'custom' ? 'Cancel anytime. Only the admin is charged; team inherits access.' : 'Let’s tailor features and pricing for your org.'}
              </div>
            </CardContent>
          </Card>
        ))}
      </main>

      <aside className="mt-4 flex flex-wrap gap-3">
        <Button variant="outline" onClick={handleManage} disabled={isLoading !== null}>
          {isLoading === 'manage' ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Manage subscription
        </Button>
        {subscribed === false && !isAdmin && (
          <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <X className="h-4 w-4" /> Your organization needs an active subscription. Ask your admin to subscribe.
          </div>
        )}
      </aside>
    </div>
  );
}
