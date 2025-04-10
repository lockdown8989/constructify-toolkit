
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { WorkflowNotification, castDatabaseResult } from '@/types/workflow';

export const useWorkflowNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get all notifications for the current user
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['workflow-notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('workflow_notifications')
        .select('*')
        .eq('receiver_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workflow notifications:', error);
        throw error;
      }

      return castDatabaseResult<WorkflowNotification[]>(data);
    },
    enabled: !!user
  });

  // Get unread notification count
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['workflow-notifications-unread', user?.id],
    queryFn: async () => {
      if (!user) return 0;

      const { count, error } = await supabase
        .from('workflow_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error fetching unread count:', error);
        throw error;
      }

      return count || 0;
    },
    enabled: !!user
  });

  // Create a new notification
  const { mutate: createNotification } = useMutation({
    mutationFn: async (notification: Omit<WorkflowNotification, 'id' | 'created_at' | 'read'>) => {
      const { data, error } = await supabase
        .from('workflow_notifications')
        .insert({
          ...notification,
          read: false
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating notification:', error);
        throw error;
      }

      return castDatabaseResult<WorkflowNotification>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-notifications-unread'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to create notification: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Mark a notification as read
  const { mutate: markAsRead } = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('workflow_notifications')
        .update({ read: true })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error marking notification as read:', error);
        throw error;
      }

      return castDatabaseResult<WorkflowNotification>(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-notifications-unread'] });
    }
  });

  // Mark all notifications as read
  const { mutate: markAllAsRead } = useMutation({
    mutationFn: async () => {
      if (!user) return null;

      const { error } = await supabase
        .from('workflow_notifications')
        .update({ read: true })
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (error) {
        console.error('Error marking all notifications as read:', error);
        throw error;
      }

      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflow-notifications'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-notifications-unread'] });
    }
  });

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    createNotification,
    markAsRead,
    markAllAsRead
  };
};
