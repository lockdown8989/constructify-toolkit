import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield } from 'lucide-react';

const SubscriptionBadge = () => {
  const { subscribed, subscriptionTier, isAdmin } = useAuth();

  // Show badge to all authenticated users once subscription state is known
  if (subscribed === undefined) return null;

  if (!subscribed) {
    return (
      <Badge variant="secondary" className="text-xs">
        <Shield className="w-3 h-3 mr-1" />
        Free
      </Badge>
    );
  }

  const tierIcon = subscriptionTier === 'pro' ? Crown : Shield;
  const TierIcon = tierIcon;

  return (
    <Badge variant="default" className="text-xs">
      <TierIcon className="w-3 h-3 mr-1" />
      {subscriptionTier === 'pro' 
        ? 'PRO' 
        : subscriptionTier?.charAt(0).toUpperCase() + subscriptionTier?.slice(1) || 'Active'}
    </Badge>
  );
};

export default SubscriptionBadge;