import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAuthMonitoring = (user: User | null) => {
  useEffect(() => {
    if (!user) return;

    // Monitor auth events and user role changes
    const authChannel = supabase
      .channel('auth_monitoring')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_roles',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('🔑 User role change detected:', payload);
          // Force a page refresh to apply new permissions
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            setTimeout(() => {
              window.location.reload();
            }, 1000);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'employees',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('👤 Employee record change detected:', payload);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(authChannel);
    };
  }, [user]);
};