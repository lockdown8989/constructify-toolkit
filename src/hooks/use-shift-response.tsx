
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { toast } from '@/hooks/use-toast';
import { ScheduleStatus } from '@/types/supabase/schedules';

export const useShiftResponse = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const respondToShift = useMutation({
    mutationFn: async ({ 
      scheduleId, 
      response 
    }: { 
      scheduleId: string, 
      response: 'accepted' | 'rejected'
    }) => {
      try {
        if (!user) {
          throw new Error('User not authenticated');
        }

        console.log(`Processing shift response: ${response} for schedule ID: ${scheduleId}`);

        // Map the response to the correct status enum value
        const statusValue: ScheduleStatus = response === 'accepted' ? 'confirmed' : 'rejected';

        // Update the shift status in Supabase
        const { data: scheduleData, error: updateError } = await supabase
          .from('schedules')
          .update({
            status: statusValue,
            updated_at: new Date().toISOString()
          })
          .eq('id', scheduleId)
          .select('*')
          .single();

        if (updateError) {
          console.error('Error updating shift status:', updateError);
          throw new Error(`Failed to update shift status: ${updateError.message}`);
        }

        console.log('Schedule data after update:', scheduleData);

        // Get employee name for the notification
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('name')
          .eq('user_id', user.id)
          .single();

        if (employeeError) {
          console.error('Error fetching employee data:', employeeError);
          // Continue execution even if employee data fetch fails
        }

        const employeeName = employeeData?.name || 'An employee';
        
        // Create notification for managers about the shift response
        const { data: managerRoles } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', ['manager', 'admin', 'hr']);
        
        if (managerRoles && managerRoles.length > 0) {
          // Create notifications for all managers
          const notifications = managerRoles.map(manager => ({
            user_id: manager.user_id,
            title: `Shift ${response === 'accepted' ? 'Accepted' : 'Rejected'}`,
            message: `${employeeName} has ${response === 'accepted' ? 'accepted' : 'rejected'} a shift scheduled for ${new Date(scheduleData.start_time).toLocaleDateString()}.`,
            type: 'info',
            related_entity: 'schedules',
            related_id: scheduleId
          }));
          
          // Insert all notifications
          const { error: notificationError } = await supabase
            .from('notifications')
            .insert(notifications);
            
          if (notificationError) {
            console.error('Error creating manager notifications:', notificationError);
          }
        }
        
        console.log('Successfully updated shift status:', response);
        return scheduleData;
      } catch (error) {
        console.error('Error responding to shift:', error);
        throw error;
      }
    },
    onSuccess: () => {
      // Refresh the schedules data after successful response
      queryClient.invalidateQueries({ queryKey: ['schedules'] });
    },
    onError: (error) => {
      // Add a user-friendly error toast
      toast({
        title: 'Shift Response Failed',
        description: error instanceof Error ? error.message : 'Unable to process your shift response.',
        variant: 'destructive',
      });
    }
  });

  return { respondToShift };
};
