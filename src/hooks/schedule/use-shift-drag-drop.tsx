
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OpenShiftType } from '@/types/supabase/schedules';

export const useShiftDragDrop = (refreshSchedules: () => void) => {
  const { toast } = useToast();
  const [droppedShiftId, setDroppedShiftId] = useState<string | null>(null);

  // Function to handle shift drag start
  const handleShiftDragStart = (e: React.DragEvent, shift: OpenShiftType) => {
    // Set the data to be transferred
    e.dataTransfer.setData('shiftId', shift.id);
    e.dataTransfer.effectAllowed = 'move';
  };
  
  // Function to handle shift drag end
  const handleShiftDragEnd = () => {
    // Reset any drag-related UI states if needed
  };

  // Function to handle shift drops
  const handleShiftDrop = async (shiftId: string) => {
    try {
      // Get employee ID for the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication error",
          description: "Please log in to claim shifts.",
          variant: "destructive"
        });
        return;
      }
      
      const { data: employeeData } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();
        
      if (!employeeData) {
        toast({
          title: "Employee record not found",
          description: "Could not find your employee record.",
          variant: "destructive"
        });
        return;
      }
      
      // Create an assignment record
      const { data, error } = await supabase
        .from('open_shift_assignments')
        .insert([{
          open_shift_id: shiftId,
          employee_id: employeeData.id,
          status: 'confirmed'
        }])
        .select()
        .single();
        
      if (error) {
        console.error('Error assigning shift:', error);
        toast({
          title: "Error",
          description: "Failed to assign the shift. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      // Update the open shift status
      await supabase
        .from('open_shifts')
        .update({ status: 'assigned' })
        .eq('id', shiftId);
        
      // Set the dropped shift ID to highlight it
      setDroppedShiftId(shiftId);
      
      toast({
        title: "Shift assigned",
        description: "The shift has been added to your schedule.",
      });
      
      // Refresh schedules to show the new shift
      refreshSchedules();
      
    } catch (error) {
      console.error('Error in shift assignment:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    }
  };

  return {
    droppedShiftId,
    handleShiftDragStart,
    handleShiftDragEnd,
    handleShiftDrop
  };
};
