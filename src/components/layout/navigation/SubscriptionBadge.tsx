import { useAuth } from '@/hooks/use-auth';
import { Badge } from '@/components/ui/badge';
import { Crown, Shield, Clock } from 'lucide-react';

const SubscriptionBadge = () => {
  const { subscribed, subscriptionTier, subscriptionIsTrial, subscriptionTrialEnd } = useAuth();

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

  const daysLeft = subscriptionIsTrial && subscriptionTrialEnd
    ? Math.max(0, Math.ceil((new Date(subscriptionTrialEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  return (
    <Badge variant="default" className="text-xs">
      {subscriptionIsTrial ? (
        <>
          <Clock className="w-3 h-3 mr-1" />
          {subscriptionTier === 'pro' ? 'PRO Trial' : 'Trial'}{typeof daysLeft === 'number' ? ` • ${daysLeft}d` : ''}
        </>
      ) : (
        <>
          <TierIcon className="w-3 h-3 mr-1" />
          {subscriptionTier === 'pro' 
            ? 'PRO' 
            : subscriptionTier?.charAt(0).toUpperCase() + subscriptionTier?.slice(1) || 'Active'}
        </>
      )}
    </Badge>
  );
};

export default SubscriptionBadge;