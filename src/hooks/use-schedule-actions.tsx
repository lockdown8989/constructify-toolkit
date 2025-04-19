
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Schedule } from '@/types/supabase/schedules';

export const useScheduleActions = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleShiftAction = async (scheduleId: string, action: 'confirm' | 'cancel') => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('schedules')
        .update({ 
          status: action === 'confirm' ? 'confirmed' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleId);

      if (error) throw error;

      toast({
        title: action === 'confirm' ? "Shift confirmed" : "Shift cancelled",
        description: action === 'confirm' 
          ? "The shift has been confirmed successfully."
          : "The shift has been cancelled successfully.",
        variant: "default",
      });

    } catch (error) {
      console.error('Error handling shift action:', error);
      toast({
        title: "Error",
        description: "There was an error processing your request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    handleShiftAction,
    isLoading
  };
};
