import React from 'react';
import { Shift, OpenShift } from '@/types/restaurant-schedule';
import ShiftEditDialog from './ShiftEditDialog';
import { useAuth } from '@/hooks/use-auth';
import { useCreateSchedule } from '@/hooks/use-schedules';
import { useShiftDialog } from '@/hooks/use-shift-dialog';
import { createShiftScheduleEntry, sendShiftAssignmentNotification } from '@/utils/shift-assignment-utils';
import { toast as sonnerToast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useShiftAssignment } from '@/hooks/use-shift-assignment';

interface ShiftDialogManagerProps {
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (shift: Shift) => void;
}

const ShiftDialogManager = ({ addShift, updateShift }: ShiftDialogManagerProps) => {
  const { user } = useAuth();
  const { createSchedule, isCreating } = useCreateSchedule();
  const { assignShift } = useShiftAssignment();
  const shiftDialog = useShiftDialog();

  const handleFormSubmit = async (formData: any) => {
    if (shiftDialog.mode === 'add' && shiftDialog.employeeId && shiftDialog.day) {
      const newShift = {
        employeeId: shiftDialog.employeeId,
        day: shiftDialog.day,
        ...formData
      };
      
      addShift(newShift);

      if (user) {
        try {
          // Using mutateAsync instead of mutate to get the returned data
          const scheduleData = await createSchedule.mutateAsync({
            employee_id: shiftDialog.employeeId,
            title: formData.role || 'Shift',
            start_time: new Date().toISOString(),
            end_time: new Date().toISOString(),
            status: 'confirmed' as const,
            notes: formData.notes || ''
          });

          await sendShiftAssignmentNotification(
            shiftDialog.employeeId, 
            { title: formData.role }, 
            scheduleData.id
          );

          sonnerToast.success('Shift added successfully');
        } catch (error) {
          console.error('Error adding shift:', error);
          sonnerToast.error('Failed to save shift');
        }
      }
    } else if (shiftDialog.mode === 'edit' && shiftDialog.currentShift) {
      const updatedShift = {
        ...shiftDialog.currentShift,
        ...formData
      };
      
      updateShift(updatedShift);
    }
    
    shiftDialog.closeDialog();
  };

  const handleAssignOpenShift = async (openShiftId: string, employeeId?: string) => {
    if (!employeeId) {
      const { data: employees, error: employeesError } = await supabase
        .from('employees')
        .select('id, name, user_id')
        .order('name');

      if (employeesError) {
        console.error('Error fetching employees:', employeesError);
        sonnerToast.error('Could not load employees');
        return;
      }

      shiftDialog.openAddShiftDialog(employees[0].id, 'monday'); // Default to first employee
      return;
    }

    try {
      await assignShift.mutateAsync({ openShiftId, employeeId });
      sonnerToast.success('Shift assigned successfully');
    } catch (error) {
      console.error('Error assigning shift:', error);
      sonnerToast.error('Failed to assign shift');
    }
  };

  return {
    handleAddShift: shiftDialog.openAddShiftDialog,
    handleEditShift: shiftDialog.openEditShiftDialog,
    handleAssignOpenShift,
    ShiftDialogComponent: (
      <ShiftEditDialog
        isOpen={shiftDialog.isOpen}
        onClose={shiftDialog.closeDialog}
        onSave={handleFormSubmit}
        mode={shiftDialog.mode}
        shift={shiftDialog.currentShift}
      />
    )
  };
};

export default ShiftDialogManager;
