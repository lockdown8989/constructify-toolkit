
import { useState } from 'react';
import { Schedule, useUpdateSchedule } from '@/hooks/use-schedules';
import { useToast } from '@/hooks/use-toast';

export const useShiftActions = () => {
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null);
  const [isAddShiftOpen, setIsAddShiftOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { updateSchedule } = useUpdateSchedule();
  const { toast } = useToast();

  const handleEditShift = (schedule: Schedule) => {
    if (!schedule.can_be_edited && !schedule.is_draft) {
      toast({
        title: "Cannot Edit Shift",
        description: "This shift has been published and cannot be edited.",
        variant: "destructive"
      });
      return;
    }
    
    setSelectedSchedule(schedule);
    setIsEditDialogOpen(true);
  };

  const handleAddShift = (date: Date) => {
    setSelectedDate(date);
    setIsAddShiftOpen(true);
  };

  const handleDeleteShift = async (schedule: Schedule) => {
    if (schedule.published && !schedule.is_draft) {
      toast({
        title: "Cannot Delete Shift",
        description: "Published shifts cannot be deleted. Please unpublish first.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Mark as deleted by updating status
      updateSchedule({
        ...schedule,
        status: 'rejected' as any,
        notes: (schedule.notes || '') + ' [CANCELLED]'
      });
      
      toast({
        title: "Shift Deleted",
        description: "The shift has been successfully deleted.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete shift. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditSubmit = (updatedSchedule: Schedule) => {
    updateSchedule(updatedSchedule);
    setIsEditDialogOpen(false);
    setSelectedSchedule(null);
    
    toast({
      title: "Shift Updated",
      description: "The shift has been successfully updated.",
    });
  };

  const closeEditDialog = () => {
    setIsEditDialogOpen(false);
    setSelectedSchedule(null);
  };

  const closeAddShiftDialog = () => {
    setIsAddShiftOpen(false);
    setSelectedDate(null);
  };

  return {
    // State
    isEditDialogOpen,
    selectedSchedule,
    isAddShiftOpen,
    selectedDate,
    
    // Actions
    handleEditShift,
    handleAddShift,
    handleDeleteShift,
    handleEditSubmit,
    closeEditDialog,
    closeAddShiftDialog
  };
};
