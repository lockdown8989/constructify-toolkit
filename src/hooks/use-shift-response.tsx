
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { sendNotification } from '@/services/notifications/notification-sender';

export const useShiftResponse = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const respondToShift = useMutation({
    mutationFn: async ({ 
      scheduleId, 
      response, 
      managerUserId 
    }: { 
      scheduleId: string, 
      response: 'accepted' | 'rejected',
      managerUserId?: string
    }) => {
      try {
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Update the shift status
        const { data: scheduleData, error: updateError } = await supabase
          .from('schedules')
          .update({
            status: response === 'accepted' ? 'confirmed' : 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('id', scheduleId)
          .select('*, employees(name)')
          .single();

        if (updateError) {
          throw new Error(`Failed to update shift status: ${updateError.message}`);
        }

        // Get employee details
        const { data: employee, error: employeeError } = await supabase
          .from('employees')
          .select('name, user_id')
          .eq('id', scheduleData.employee_id)
          .single();

        if (employeeError) {
          console.error('Error fetching employee details:', employeeError);
        }

        // Get manager details if we have their ID
        let managerName = 'Manager';
        if (managerUserId) {
          const { data: managerData } = await supabase
            .from('employees')
            .select('name')
            .eq('user_id', managerUserId)
            .single();
          
          if (managerData) {
            managerName = managerData.name;
          }
        }
        
        // Send notification to manager
        const employeeName = employee?.name || 'Employee';
        const shiftDate = new Date(scheduleData.start_time).toLocaleDateString();
        const shiftTime = new Date(scheduleData.start_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
        
        // Find the manager's user_id
        // If we don't have the manager's user ID directly, we need to find them from their employee record
        if (!managerUserId) {
          const { data: managers } = await supabase
            .from('user_roles')
            .select('user_id')
            .eq('role', 'manager');
          
          if (managers && managers.length > 0) {
            for (const manager of managers) {
              // Send notification to each manager
              await sendNotification({
                user_id: manager.user_id,
                title: response === 'accepted' ? '✅ Shift Accepted' : '❌ Shift Rejected',
                message: response === 'accepted' 
                  ? `${employeeName} has accepted the shift on ${shiftDate} at ${shiftTime}.`
                  : `${employeeName} has rejected the shift on ${shiftDate} at ${shiftTime}.`,
                type: response === 'accepted' ? 'success' : 'warning',
                related_entity: 'schedules',
                related_id: scheduleId
              });
            }
          }
        } else {
          // Send notification directly to the manager who created the shift
          await sendNotification({
            user_id: managerUserId,
            title: response === 'accepted' ? '✅ Shift Accepted' : '❌ Shift Rejected',
            message: response === 'accepted' 
              ? `${employeeName} has accepted the shift on ${shiftDate} at ${shiftTime}.`
              : `${employeeName} has rejected the shift on ${shiftDate} at ${shiftTime}.`,
            type: response === 'accepted' ? 'success' : 'warning',
            related_entity: 'schedules',
            related_id: scheduleId
          });
        }

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
      console.error('Failed to respond to shift:', error);
      toast.error('Failed to respond to shift. Please try again.');
    }
  });

  return { respondToShift };
};
