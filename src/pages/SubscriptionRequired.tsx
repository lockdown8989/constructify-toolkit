import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useSubscription } from '@/hooks/subscription/useSubscription';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Crown, Users, Clock, Settings } from 'lucide-react';
import { toast } from 'sonner';

const SubscriptionRequired = () => {
  const { user, isManager, rolesLoaded } = useAuth();
  const { subscribed, loading, createCheckout, checkSubscription } = useSubscription();

  useEffect(() => {
    if (user && rolesLoaded) {
      checkSubscription();
    }
  }, [user, rolesLoaded]);

  // Redirect if already subscribed or not a manager
  if (subscribed && isManager) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!isManager && rolesLoaded) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubscribe = async () => {
    toast.success('Opening Stripe checkout...');
    await createCheckout();
  };

  if (loading || !user || !rolesLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <Crown className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h1 className="text-3xl font-bold mb-2">Manager Subscription Required</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            As a manager, you need an active subscription to unlock your team's access to the full platform.
          </p>
        </div>

        {/* Pricing Card */}
        <Card className="relative overflow-hidden border-2 border-primary/20 shadow-lg hover:shadow-xl transition-shadow">
          <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-4 py-1 rounded-bl-lg">
            <span className="font-semibold text-sm">RECOMMENDED</span>
          </div>
          
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-2xl font-bold text-primary">TeamPulse Pro</CardTitle>
            <CardDescription className="text-lg">Professional employee management platform</CardDescription>
            <div className="mt-4">
              <span className="text-4xl font-bold">$29</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Features */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Unlimited employee accounts</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Advanced scheduling & rota management</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>GPS time tracking & attendance</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Payroll management & exports</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Real-time notifications</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Document management</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Team communication tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-green-600" />
                  <span>Priority support</span>
                </div>
              </div>
            </div>

            {/* Benefits */}
            <div className="bg-muted/50 rounded-lg p-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                What happens after you subscribe:
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Your employees and payroll staff get instant access</span>
                </div>
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  <span>Full manager dashboard with all administrative features</span>
                </div>
                <div className="flex items-center gap-2">
                  <Crown className="h-4 w-4" />
                  <span>Share your Manager ID with team members to connect them</span>
                </div>
              </div>
            </div>

            {/* CTA Button */}
            <Button 
              onClick={handleSubscribe}
              size="lg" 
              className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary text-lg py-6"
            >
              Subscribe & Activate Team Access
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Cancel anytime. 30-day money-back guarantee. Secure payment via Stripe.
            </p>
          </CardContent>
        </Card>

        {/* Back to dashboard link */}
        <div className="text-center mt-6">
          <Button variant="ghost" asChild className="text-muted-foreground">
            <a href="/dashboard">← Back to Dashboard</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionRequired;