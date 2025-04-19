
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
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (shift: Shift) => void;
  onResponseComplete?: () => void;
}

const ShiftDialogManager = ({ addShift, updateShift, onResponseComplete }: ShiftDialogManagerProps) => {
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
          const { data: employee, error: employeeError } = await supabase
            .from('employees')
            .select('user_id, name')
            .eq('id', shiftDialog.employeeId)
            .single();

          if (employeeError) {
            console.error('Error fetching employee details:', employeeError);
            sonnerToast.error('Could not find employee details');
            return;
          }

          const { data: manager, error: managerError } = await supabase
            .from('employees')
            .select('name')
            .eq('user_id', user.id)
            .single();

          const managerName = managerError ? 'Manager' : (manager?.name || 'Manager');
          
          const scheduleData = await createSchedule.mutateAsync({
            employee_id: shiftDialog.employeeId,
            title: formData.role || 'Shift',
            start_time: new Date(formData.startTime).toISOString(),
            end_time: new Date(formData.endTime).toISOString(),
            status: 'pending' as const,
            notes: formData.notes || ''
          });

          if (employee?.user_id) {
            await sendNotification({
              user_id: employee.user_id,
              title: 'New Shift Request 📅',
              message: `You've received a new shift request from ${managerName}. Please respond.`,
              type: 'info',
              related_entity: 'schedules',
              related_id: scheduleData.id
            });
          }

          sonnerToast.success('Shift request sent to employee');
          
          if (onResponseComplete) {
            onResponseComplete();
          }
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

      shiftDialog.openAddShiftDialog(employees[0].id, 'monday');
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
