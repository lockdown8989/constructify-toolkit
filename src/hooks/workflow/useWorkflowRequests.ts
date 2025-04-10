
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { WorkflowRequest, WorkflowNotification, castDatabaseResult } from '@/types/workflow';

export const useWorkflowRequests = () => {
  const { user, isManager, isAdmin, isHR } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const hasManagerAccess = isManager || isAdmin || isHR;

  // Get all requests for the current user
  const { data: userRequests = [], isLoading: isLoadingUserRequests } = useQuery({
    queryKey: ['workflow-requests-user', user?.id],
    queryFn: async () => {
      if (!user) return [];

      const { data, error } = await supabase
        .from('workflow_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching user workflow requests:', error);
        throw error;
      }

      return castDatabaseResult<WorkflowRequest[]>(data);
    },
    enabled: !!user
  });

  // Get all pending requests for managers to review
  const { data: pendingRequests = [], isLoading: isLoadingPendingRequests } = useQuery({
    queryKey: ['workflow-requests-pending', user?.id],
    queryFn: async () => {
      if (!user || !hasManagerAccess) return [];

      const { data, error } = await supabase
        .from('workflow_requests')
        .select('*')
        .eq('status', 'pending')
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Error fetching pending workflow requests:', error);
        throw error;
      }

      return castDatabaseResult<WorkflowRequest[]>(data);
    },
    enabled: !!user && hasManagerAccess
  });

  // Create a new request
  const { mutate: createRequest } = useMutation({
    mutationFn: async (request: Omit<WorkflowRequest, 'id' | 'submitted_at' | 'status' | 'reviewed_by'>) => {
      const { data, error } = await supabase
        .from('workflow_requests')
        .insert({
          ...request,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating request:', error);
        throw error;
      }

      return castDatabaseResult<WorkflowRequest>(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-requests-user'] });
      
      // Also notify managers about the new request
      notifyManagers(data);
      
      toast({
        title: 'Request Submitted',
        description: 'Your request has been submitted for review.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to submit request: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Update request status
  const { mutate: updateRequestStatus } = useMutation({
    mutationFn: async ({ id, status, reviewed_by = user?.id }: { id: string; status: 'approved' | 'rejected'; reviewed_by?: string }) => {
      const { data, error } = await supabase
        .from('workflow_requests')
        .update({ 
          status,
          reviewed_by
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating request status:', error);
        throw error;
      }

      return castDatabaseResult<WorkflowRequest>(data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['workflow-requests-user'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-requests-pending'] });
      
      // Also notify the requester about the status change
      notifyRequester(data);
      
      toast({
        title: 'Request Updated',
        description: `The request has been ${data.status}.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: `Failed to update request: ${error.message}`,
        variant: 'destructive',
      });
    }
  });

  // Helper function to notify managers about a new request
  const notifyManagers = async (request: WorkflowRequest) => {
    try {
      // Get all manager user IDs
      const { data: managerRoles, error: roleError } = await supabase
        .from('user_roles')
        .select('user_id')
        .in('role', ['admin', 'hr', 'employer']);

      if (roleError) {
        console.error('Error fetching manager roles:', roleError);
        return;
      }

      const managerIds = managerRoles.map(role => role.user_id);
      if (managerIds.length === 0) return;

      // Create notifications for all managers
      const notifications = managerIds.map(managerId => ({
        sender_id: request.user_id,
        receiver_id: managerId,
        type: request.request_type,
        message: `New ${request.request_type} request requires your review.`,
        status: 'pending'
      }));

      // Insert the notifications
      await supabase
        .from('workflow_notifications')
        .insert(notifications);
    } catch (error) {
      console.error('Error notifying managers:', error);
    }
  };

  // Helper function to notify the requester about a status change
  const notifyRequester = async (request: WorkflowRequest) => {
    try {
      if (!user) return;

      // Insert a notification for the requester
      await supabase
        .from('workflow_notifications')
        .insert({
          sender_id: user.id,
          receiver_id: request.user_id,
          type: request.request_type,
          message: `Your ${request.request_type} request has been ${request.status}.`,
          status: request.status
        });
    } catch (error) {
      console.error('Error notifying requester:', error);
    }
  };

  return {
    userRequests,
    pendingRequests,
    isLoadingUserRequests,
    isLoadingPendingRequests,
    createRequest,
    updateRequestStatus
  };
};
