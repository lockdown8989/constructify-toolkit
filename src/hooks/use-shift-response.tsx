
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ShiftStatus = 'employee_accepted' | 'employee_rejected' | 'pending' | 'confirmed' | 'rejected' | 'completed';

export const useShiftResponse = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const respondToShift = async (shiftId: string, status: ShiftStatus) => {
    setIsLoading(true);
    
    try {
      // Update the shift status
      const { error } = await supabase
        .from('schedules')
        .update({ status })
        .eq('id', shiftId);
      
      if (error) {
        console.error('Error responding to shift:', error);
        toast({
          title: 'Error',
          description: 'There was a problem updating your response. Please try again later.',
          variant: 'destructive',
        });
        return false;
      }
      
      // If accepted, we fetch the shift details to include in notifications
      if (status === 'employee_accepted') {
        // Fetch the shift details
        const { data: shift } = await supabase
          .from('schedules')
          .select('title, start_time, end_time')
          .eq('id', shiftId)
          .single();
        
        if (shift) {
          // Format the dates for display
          const startDate = new Date(shift.start_time);
          const formattedDate = startDate.toLocaleDateString(undefined, {
            weekday: 'long',
            month: 'long',
            day: 'numeric'
          });
          
          toast({
            title: 'Shift Accepted',
            description: `You've accepted the shift "${shift.title}" on ${formattedDate}`,
            variant: 'success',
          });
        }
      }
      
      return true;
    } catch (error) {
      console.error('Exception in respondToShift:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again later.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  return { respondToShift, isLoading };
};
