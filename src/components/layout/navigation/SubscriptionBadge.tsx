import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const SubscriptionBadge = () => {
  const { subscribed, subscriptionTier, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleManageClick = async () => {
    if (!subscribed) {
      navigate('/billing');
      return;
    }
    if (!isAdmin) {
      toast({ description: 'Only administrators can manage billing' });
      return;
    }
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) throw new Error('No active session');
      const { data, error } = await supabase.functions.invoke('customer-portal', {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (error) throw error;
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No portal URL received');
      }
    } catch (e: any) {
      console.error('Customer portal error', e);
      toast({ description: e.message || 'Failed to open customer portal' });
    }
  };

  // Show badge to all authenticated users once subscription state is known
  if (subscribed === undefined) return null;

  if (!subscribed) {
    return (
      <Badge 
        variant="secondary" 
        className="text-xs cursor-pointer"
        onClick={() => isAdmin ? navigate('/billing') : toast({ description: 'Please contact an administrator to manage billing' })}
        title={isAdmin ? 'Go to billing' : 'Billing (admins only)'}
      >
        <Shield className="w-3 h-3 mr-1" />
        Free
      </Badge>
    );
  }

  const tierIcon = subscriptionTier === 'pro' ? Crown : Shield;
  const TierIcon = tierIcon;

  return (
    <Badge 
      variant="default" 
      className="text-xs cursor-pointer"
      onClick={handleManageClick}
      title="Manage subscription"
    >
      <TierIcon className="w-3 h-3 mr-1" />
      {subscriptionTier === 'pro' 
        ? 'PRO' 
        : subscriptionTier?.charAt(0).toUpperCase() + subscriptionTier?.slice(1) || 'Active'}
    </Badge>
  );
};

export default SubscriptionBadge;