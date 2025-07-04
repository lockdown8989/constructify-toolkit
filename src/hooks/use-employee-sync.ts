
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { syncEmployeeWithManagerTeam, syncEmployeeEmailWithAuth, EmployeeSyncData } from '@/services/employee-sync/employee-data-sync';

export const useEmployeeSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const syncEmployeeMutation = useMutation({
    mutationFn: async (employeeData: EmployeeSyncData) => {
      return await syncEmployeeWithManagerTeam(employeeData);
    },
    onSuccess: (result) => {
      if (result.success) {
        // Invalidate all employee-related queries to refresh data
        queryClient.invalidateQueries({ queryKey: ['employees'] });
        queryClient.invalidateQueries({ queryKey: ['employee'] });
        queryClient.invalidateQueries({ queryKey: ['team-members'] });
        
        toast({
          title: "Profile Updated",
          description: "Your information has been synchronized with your manager's team view.",
          variant: "default"
        });
      } else {
        toast({
          title: "Sync Failed",
          description: "Failed to synchronize with manager team. Please try again.",
          variant: "destructive"
        });
      }
    },
    onError: (error) => {
      console.error('Employee sync error:', error);
      toast({
        title: "Sync Error",
        description: "An error occurred while syncing your data.",
        variant: "destructive"
      });
    }
  });

  const syncEmailMutation = useMutation({
    mutationFn: async ({ userId, email }: { userId: string; email: string }) => {
      return await syncEmployeeEmailWithAuth(userId, email);
    },
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['employees'] });
        toast({
          title: "Email Updated",
          description: "Your email has been updated and synchronized.",
          variant: "default"
        });
      }
    },
    onError: (error) => {
      console.error('Email sync error:', error);
      toast({
        title: "Email Update Failed",
        description: "Failed to update email. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    syncEmployee: syncEmployeeMutation.mutate,
    syncEmail: syncEmailMutation.mutate,
    isSyncing: syncEmployeeMutation.isPending || syncEmailMutation.isPending
  };
};
