
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { createAttendanceFromShift, updateAttendanceForLeave } from '@/services/notifications/attendance-sync';

export const useAttendanceSync = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { user } = useAuth();
  
  useEffect(() => {
    if (!user) return;
    
    const channel = supabase
      .channel('attendance-sync')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'schedules'
        },
        async (payload) => {
          try {
            const newShift = payload.new;
            
            if (newShift && newShift.employee_id) {
              // Extract date from the start_time
              const shiftDate = new Date(newShift.start_time).toISOString().split('T')[0];
              
              // Create attendance record for this shift
              const result = await createAttendanceFromShift(
                newShift.employee_id,
                shiftDate,
                newShift.start_time,
                newShift.end_time
              );
              
              if (result.success) {
                console.log('Attendance record created/updated for new shift:', result);
                
                // Invalidate relevant queries
                queryClient.invalidateQueries({ queryKey: ['attendance'] });
              } else {
                console.error('Failed to create attendance from shift:', result.error);
              }
            }
          } catch (error) {
            console.error('Error in shift-to-attendance sync:', error);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'leave_calendar'
        },
        async (payload) => {
          try {
            const updatedLeave = payload.new;
            const oldLeave = payload.old;
            
            // Only process when a leave request is approved
            if (
              updatedLeave &&
              updatedLeave.status === 'Approved' && 
              oldLeave.status !== 'Approved' &&
              updatedLeave.employee_id
            ) {
              console.log('Leave request approved:', updatedLeave);
              
              // Update attendance records for the leave period
              const result = await updateAttendanceForLeave(
                updatedLeave.employee_id,
                updatedLeave.start_date,
                updatedLeave.end_date,
                updatedLeave.type
              );
              
              if (result.success) {
                console.log('Attendance records updated for approved leave:', result);
                
                // Show toast notification
                toast({
                  title: 'Leave Request Processed',
                  description: 'Attendance records and schedule have been updated.',
                });
                
                // Invalidate relevant queries
                queryClient.invalidateQueries({ queryKey: ['attendance'] });
                queryClient.invalidateQueries({ queryKey: ['schedules'] });
              } else {
                console.error('Failed to update attendance for leave:', result.error);
              }
            }
          } catch (error) {
            console.error('Error in leave-to-attendance sync:', error);
          }
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast, user]);
};
