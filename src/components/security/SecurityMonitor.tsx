
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface SecurityEvent {
  id: string;
  event_type: string;
  timestamp: string;
  additional_data?: any;
}

export const SecurityMonitor: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const fetchSecurityEvents = async () => {
      try {
        const { data, error } = await supabase
          .from('auth_events')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(10);

        if (error) {
          console.error('Error fetching security events:', error);
        } else {
          setSecurityEvents(data || []);
        }
      } catch (error) {
        console.error('Security monitoring error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityEvents();
  }, [user, isAdmin]);

  if (!isAdmin) return null;

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'sign_in_success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'sign_in_failed':
      case 'password_reset_failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <Shield className="h-4 w-4 text-blue-500" />;
    }
  };

  const getEventColor = (eventType: string) => {
    switch (eventType) {
      case 'sign_in_success':
        return 'border-l-green-500';
      case 'sign_in_failed':
      case 'password_reset_failed':
        return 'border-l-red-500';
      default:
        return 'border-l-blue-500';
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Security Events</h3>
      </div>
      
      {loading ? (
        <p className="text-gray-500">Loading security events...</p>
      ) : securityEvents.length === 0 ? (
        <p className="text-gray-500">No security events recorded.</p>
      ) : (
        <div className="space-y-3">
          {securityEvents.map((event) => (
            <div
              key={event.id}
              className={`p-3 rounded-lg border-l-4 ${getEventColor(event.event_type)} bg-gray-50`}
            >
              <div className="flex items-start gap-3">
                {getEventIcon(event.event_type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium capitalize">
                      {event.event_type.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  {event.additional_data?.email && (
                    <p className="text-sm text-gray-600 mt-1">
                      Email: {event.additional_data.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
