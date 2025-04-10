
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Shift } from '@/types/restaurant-schedule';

export const useShiftUtilities = (updateShift: (shift: Shift) => void) => {
  const { toast } = useToast();

  // Handle adding a note to a shift
  const handleAddNote = (shiftId: string, shifts: Shift[]) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
      const updatedShift = {
        ...shift,
        notes: 'New note'
      };
      
      updateShift(updatedShift);
      
      toast({
        title: "Note added",
        description: "A note has been added to the shift",
      });
    }
  };
  
  // Handle adding a break to a shift
  const handleAddBreak = (shiftId: string, shifts: Shift[]) => {
    const shift = shifts.find(s => s.id === shiftId);
    if (shift) {
      const updatedShift = {
        ...shift,
        hasBreak: true,
        breakDuration: 30
      };
      
      updateShift(updatedShift);
      
      toast({
        title: "Break added",
        description: "A 30-minute break has been added to the shift",
      });
    }
  };

  return {
    handleAddNote,
    handleAddBreak
  };
};

export default useShiftUtilities;
