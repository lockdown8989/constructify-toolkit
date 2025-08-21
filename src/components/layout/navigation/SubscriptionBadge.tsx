
import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

const SubscriptionBadge = () => {
  const { subscribed, subscriptionTier, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleBadgeClick = async () => {
    if (!isAdmin) {
      toast({ 
        description: 'Please contact an administrator to manage billing',
        duration: 3000
      });
      return;
    }

    // Always redirect to billing page first where they can see their current plan
    // and manage their subscription
    console.log('🔗 Redirecting to billing page from PRO badge...');
    navigate('/billing');
  };

  // Show badge to all authenticated users once subscription state is known
  if (subscribed === undefined) return null;

  if (!subscribed) {
    return (
      <Badge 
        variant="secondary" 
        className="text-xs cursor-pointer hover:bg-secondary/80 transition-colors"
        onClick={handleBadgeClick}
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
      className="text-xs cursor-pointer hover:bg-primary/90 transition-colors"
      onClick={handleBadgeClick}
      title="View and manage your subscription plan"
    >
      <TierIcon className="w-3 h-3 mr-1" />
      {subscriptionTier === 'pro' 
        ? 'PRO' 
        : subscriptionTier?.charAt(0).toUpperCase() + subscriptionTier?.slice(1) || 'Active'}
    </Badge>
  );
};

export default SubscriptionBadge;
