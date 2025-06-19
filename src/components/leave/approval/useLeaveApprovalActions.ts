
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUpdateEmployee } from '@/hooks/use-employees';

export const useLeaveApprovalActions = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateEmployee = useUpdateEmployee();

  const updateLeaveStatus = useMutation({
    mutationFn: async ({ leaveId, status, managerId }: {
      leaveId: string;
      status: 'approved' | 'rejected';
      managerId: string;
    }) => {
      const { data, error } = await supabase
        .from('leave_requests')
        .update({ 
          status,
          manager_id: managerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', leaveId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leave-requests'] });
      toast({
        title: "Success",
        description: "Leave request status updated successfully",
      });
    },
    onError: (error) => {
      console.error('Error updating leave status:', error);
      toast({
        title: "Error",
        description: "Failed to update leave request status",
        variant: "destructive",
      });
    }
  });

  const updateEmployeeStatus = async (employeeId: string, status: string) => {
    try {
      // Get the complete employee data first
      const { data: employee, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', employeeId)
        .single();

      if (error) throw error;
      if (!employee) throw new Error('Employee not found');

      // Update with complete employee object
      await updateEmployee.mutateAsync({
        ...employee,
        status
      });
    } catch (error) {
      console.error("Error updating employee status:", error);
      toast({
        title: "Error",
        description: "Failed to update employee status",
        variant: "destructive",
      });
    }
  };

  return {
    updateLeaveStatus,
    updateEmployeeStatus,
    isUpdating: updateLeaveStatus.isPending
  };
};
