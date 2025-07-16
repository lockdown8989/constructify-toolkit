
import React from 'react';
import { Shift, OpenShift } from '@/types/restaurant-schedule';
import ShiftEditDialog from './ShiftEditDialog';
import { useAuth } from '@/hooks/use-auth';
import { useCreateSchedule } from '@/hooks/use-schedules';
import { useShiftDialog } from '@/hooks/use-shift-dialog';
import { createShiftScheduleEntry } from '@/utils/shift-assignment-utils';
import { toast as sonnerToast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useShiftAssignment } from '@/hooks/use-shift-assignment';
import { sendNotification } from '@/services/notifications/notification-sender';

interface ShiftDialogManagerProps {
  addShift: (shift: Omit<Shift, 'id'>) => Promise<void>;
  updateShift: (shift: Shift) => Promise<void>;
  deleteShift?: (shift: Shift) => Promise<void>;
  onResponseComplete?: () => void;
}

const ShiftDialogManager = ({ 
  addShift, 
  updateShift, 
  deleteShift,
  onResponseComplete 
}: ShiftDialogManagerProps) => {
  const { user } = useAuth();
  const { createSchedule, isCreating } = useCreateSchedule();
  const { assignShift } = useShiftAssignment();
  const shiftDialog = useShiftDialog();

  const handleSave = async (formData: any) => {
    if (shiftDialog.mode === 'add' && shiftDialog.employeeId && shiftDialog.day) {
      try {
        console.log('Creating shift for employee:', shiftDialog.employeeId, 'on day:', shiftDialog.day);
        
        const localShift: Omit<Shift, 'id'> = {
          employeeId: shiftDialog.employeeId,
          day: shiftDialog.day,
          startTime: formData.startTime,
          endTime: formData.endTime,
          role: formData.role || 'Staff',
          notes: formData.notes
        };

        await addShift(localShift);

        sonnerToast.success('Shift created successfully', {
          description: `Shift assigned to employee for ${shiftDialog.day}`
        });

        // Call the response complete callback to refresh data
        if (onResponseComplete) {
          onResponseComplete();
        }

        // Close the dialog
        shiftDialog.closeDialog();

      } catch (error) {
        console.error('Error creating shift:', error);
        sonnerToast.error('Failed to create shift', {
          description: error instanceof Error ? error.message : 'Unknown error occurred'
        });
      }
    } else if (shiftDialog.mode === 'edit' && shiftDialog.editingShift) {
      try {
        console.log('Updating shift:', shiftDialog.editingShift.id);
        
        const updatedShift = {
          ...shiftDialog.editingShift,
          startTime: formData.startTime,
          endTime: formData.endTime,
          role: formData.role,
          notes: formData.notes
        };

        await updateShift(updatedShift);
        
        sonnerToast.success('Shift updated successfully');
        shiftDialog.closeDialog();
      } catch (error) {
        console.error('Error updating shift:', error);
        sonnerToast.error('Failed to update shift');
      }
    }
  };

  const handleDelete = async (shift: Shift) => {
    if (deleteShift) {
      try {
        await deleteShift(shift);
        sonnerToast.success('Shift deleted successfully');
        
        // Call the response complete callback to refresh data
        if (onResponseComplete) {
          onResponseComplete();
        }
      } catch (error) {
        console.error('Error deleting shift:', error);
        sonnerToast.error('Failed to delete shift');
      }
    }
  };

  const ShiftDialogComponent = (
    <ShiftEditDialog
      isOpen={shiftDialog.isOpen}
      onClose={shiftDialog.closeDialog}
      onSave={handleSave}
      onDelete={deleteShift ? handleDelete : undefined}
      shift={shiftDialog.editingShift}
      mode={shiftDialog.mode}
    />
  );

  return {
    handleAddShift: shiftDialog.openAddDialog,
    handleEditShift: shiftDialog.openEditDialog,
    ShiftDialogComponent
  };
};

export default ShiftDialogManager;
