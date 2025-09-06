import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Crown, Loader2 } from 'lucide-react';

interface SubscriptionGateProps {
  children: React.ReactNode;
  fallbackMessage?: string;
}

const SubscriptionGate: React.FC<SubscriptionGateProps> = ({ 
  children, 
  fallbackMessage = "Your manager needs an active subscription for you to access this platform." 
}) => {
  const { user, isManager, isEmployee, isPayroll, rolesLoaded } = useAuth();
  const [hasManagerAccess, setHasManagerAccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [managerInfo, setManagerInfo] = useState<{ name: string; managerId: string } | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      if (!user || !rolesLoaded) return;
      
      setLoading(true);
      
      try {
        // Managers need their own subscription
        if (isManager) {
          const { data } = await supabase.functions.invoke('check-subscription');
          setHasManagerAccess(!!data?.subscribed);
          setLoading(false);
          return;
        }

        // Employees and payroll need to check if their manager has a subscription
        if (isEmployee || isPayroll) {
          const { data: employee, error } = await supabase
            .from('employees')
            .select('manager_id')
            .eq('user_id', user.id)
            .single();

          if (error || !employee?.manager_id) {
            console.error('Error fetching employee data:', error);
            setHasManagerAccess(false);
            setLoading(false);
            return;
          }

          // Find the manager with this manager_id
          const { data: manager, error: managerError } = await supabase
            .from('employees')
            .select('name, user_id, manager_id')
            .eq('manager_id', employee.manager_id)
            .single();

          if (managerError || !manager) {
            console.error('Error fetching manager data:', managerError);
            setHasManagerAccess(false);
            setLoading(false);
            return;
          }

          setManagerInfo({ name: manager.name, managerId: manager.manager_id });

          // Check if the manager has an active subscription
          const { data: subscription, error: subError } = await supabase
            .from('subscribers')
            .select('subscribed')
            .eq('user_id', manager.user_id)
            .single();

          if (subError) {
            console.error('Error fetching manager subscription:', subError);
            setHasManagerAccess(false);
          } else {
            setHasManagerAccess(!!subscription?.subscribed);
          }
        }
      } catch (error) {
        console.error('Error checking subscription access:', error);
        setHasManagerAccess(false);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [user, isManager, isEmployee, isPayroll, rolesLoaded]);

  if (loading || !rolesLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Checking access permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasManagerAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center space-y-4">
            <div className="rounded-full bg-orange-100 p-3 w-fit mx-auto">
              <AlertCircle className="h-8 w-8 text-orange-600" />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Subscription Required</h2>
              <p className="text-muted-foreground text-sm">
                {fallbackMessage}
              </p>
              
              {managerInfo && (
                <div className="bg-muted/50 rounded-lg p-3 mt-4">
                  <p className="text-sm">
                    <span className="font-medium">Your Manager:</span> {managerInfo.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-medium">Manager ID:</span> {managerInfo.managerId}
                  </p>
                </div>
              )}
            </div>

            {isManager && (
              <Button 
                className="w-full bg-gradient-to-r from-primary to-primary/80"
                onClick={() => window.location.href = '/subscription-required'}
              >
                <Crown className="h-4 w-4 mr-2" />
                Subscribe Now
              </Button>
            )}

            <Button 
              variant="ghost" 
              className="w-full"
              onClick={() => window.location.href = '/auth'}
            >
              Back to Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

export default SubscriptionGate;