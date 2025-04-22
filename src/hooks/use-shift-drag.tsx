
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OpenShiftType } from '@/types/supabase/schedules';

export function useShiftDrag() {
  const [isDragging, setIsDragging] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const updateShiftPosition = useMutation({
    mutationFn: async ({ shiftId, newPosition }: { shiftId: string; newPosition: number }) => {
      const { data, error } = await supabase
        .from('open_shifts')
        .update({ position_order: newPosition })
        .eq('id', shiftId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['open-shifts'] });
      toast({
        title: "Shift moved",
        description: "The shift position has been updated."
      });
    },
    onError: (error) => {
      console.error('Error updating shift position:', error);
      toast({
        title: "Failed to move shift",
        description: "There was an error updating the shift position.",
        variant: "destructive"
      });
    }
  });

  return {
    isDragging,
    setIsDragging,
    updateShiftPosition
  };
}
