import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  avatar_url: string | null;
  manager_id: string | null;
}

export const useRealtimeProfile = (userId: string | undefined) => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const { toast } = useToast();

  const syncProfile = useCallback(async () => {
    if (!userId) return;

    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('first_name, last_name, position, department, avatar_url')
        .eq('id', userId)
        .maybeSingle();

      const { data: employeeData } = await supabase
        .from('employees')
        .select('manager_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (profileData) {
        setProfile({
          ...profileData,
          manager_id: employeeData?.manager_id || null
        });
        setLastSync(new Date());
      }
    } catch (error) {
      console.error('Profile sync error:', error);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;

    // Initial sync
    syncProfile();

    // Set up real-time subscription for profiles
    const profilesChannel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${userId}`
        },
        (payload) => {
          console.log('Profile updated:', payload);
          if (payload.eventType !== 'DELETE') {
            setProfile(prev => ({
              ...prev,
              ...payload.new,
              manager_id: prev?.manager_id || null
            }));
            setLastSync(new Date());
            
            // Show sync notification
            toast({
              title: "Profile Updated",
              description: "Your profile has been synced with the latest changes.",
              duration: 3000,
            });
          }
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    // Set up real-time subscription for employees (manager_id changes)
    const employeesChannel = supabase
      .channel('employee-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public', 
          table: 'employees',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Employee data updated:', payload);
          if (payload.eventType !== 'DELETE') {
            setProfile(prev => prev ? {
              ...prev,
              manager_id: payload.new?.manager_id || null
            } : null);
            setLastSync(new Date());
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesChannel);
      supabase.removeChannel(employeesChannel);
    };
  }, [userId, syncProfile, toast]);

  // Network status monitoring
  useEffect(() => {
    const handleOnline = () => {
      setIsConnected(true);
      syncProfile();
    };

    const handleOffline = () => {
      setIsConnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [syncProfile]);

  return {
    profile,
    isConnected,
    lastSync,
    syncProfile
  };
};