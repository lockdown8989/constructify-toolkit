
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { LeaveEvent, LeaveRequest } from './leave-types';

/**
 * Hook to fetch all leave calendar events
 */
export function useLeaveCalendar() {
  const { user, isManager } = useAuth();
  
  return useQuery({
    queryKey: ['leave-calendar', isManager, user?.id],
    queryFn: async () => {
      try {
        console.log('Fetching leave calendar, user:', user?.id, 'isManager:', isManager);
        let query = supabase
          .from('leave_calendar')
          .select(`
            *,
            employees:employee_id (
              name,
              job_title,
              department
            )
          `);
        
        // If not a manager, only fetch the user's own leave requests
        if (!isManager && user) {
          // First get the employee ID for the current user
          const { data: employeeData } = await supabase
            .from('employees')
            .select('id')
            .eq('user_id', user.id)
            .single();
            
          if (employeeData) {
            console.log('Found employee ID:', employeeData.id);
            // Filter to show only this employee's requests
            query = query.eq('employee_id', employeeData.id);
          } else {
            console.log('No employee record found for user:', user.id);
            // If no employee record found, return empty array
            return [];
          }
        }
              
        const { data, error } = await query;
        if (error) {
          console.error('Error fetching leave calendar:', error);
          throw error;
        }
        console.log('Leave calendar fetched:', data?.length || 0, 'records');
        return data || [];
      } catch (error) {
        console.error('Exception in useLeaveCalendar:', error);
        throw error;
      }
    },
    enabled: !!user
  });
}

// Add this alias for backward compatibility
export const useLeaveCalendar = useLeaveCalendar;
