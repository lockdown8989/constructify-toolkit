
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
      try {
        // Create a valid date object from the day and time
        const today = new Date();
        const dayMap: Record<string, number> = {
          monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6, sunday: 0
        };
        
        // Get the date of the next occurrence of the day
        const dayOfWeek = dayMap[shiftDialog.day.toLowerCase()];
        const daysUntilNext = (dayOfWeek - today.getDay() + 7) % 7;
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysUntilNext);
        
        // Set the hours and minutes from the time strings
        const startTimeParts = formData.startTime.split(':');
        const endTimeParts = formData.endTime.split(':');
        
        if (startTimeParts.length !== 2 || endTimeParts.length !== 2) {
          sonnerToast.error('Invalid time format. Please use HH:MM format');
          return;
        }
        
        const startDate = new Date(targetDate);
        startDate.setHours(parseInt(startTimeParts[0], 10), parseInt(startTimeParts[1], 10), 0, 0);
        
        const endDate = new Date(targetDate);
        endDate.setHours(parseInt(endTimeParts[0], 10), parseInt(endTimeParts[1], 10), 0, 0);
        
        // If end time is earlier than start time, it must be the next day
        if (endDate < startDate) {
          endDate.setDate(endDate.getDate() + 1);
        }
        
        console.log('Creating schedule with dates:', {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          employeeId: shiftDialog.employeeId,
          role: formData.role || 'Shift'
        });
        
        // Create the schedule in the database first
        const scheduleData = await createSchedule.mutateAsync({
          employee_id: shiftDialog.employeeId,
          title: formData.role || 'Shift',
          start_time: startDate.toISOString(),
          end_time: endDate.toISOString(),
          status: 'confirmed' as const,
          notes: formData.notes || '',
          location: formData.location || '',
          published: true
        });

        console.log('Schedule created successfully:', scheduleData);

        // Create the shift for the UI
        const newShift = {
          employeeId: shiftDialog.employeeId,
          day: shiftDialog.day,
          startTime: formData.startTime,
          endTime: formData.endTime,
          role: formData.role || 'Shift',
          notes: formData.notes || '',
          location: formData.location || ''
        };
        
        // Add shift to the UI
        addShift(newShift);

        // Send notification to employee if we have their user ID
        if (user) {
          const { data: employee, error: employeeError } = await supabase
            .from('employees')
            .select('user_id, name')
            .eq('id', shiftDialog.employeeId)
            .single();

          if (!employeeError && employee?.user_id) {
            const { data: manager, error: managerError } = await supabase
              .from('employees')
              .select('name')
              .eq('user_id', user.id)
              .single();

            const managerName = managerError ? 'Manager' : (manager?.name || 'Manager');
            
            try {
              await sendNotification({
                user_id: employee.user_id,
                title: 'New Shift Assigned 📅',
                message: `You've been assigned a new shift by ${managerName} for ${formData.role || 'Shift'}.`,
                type: 'info',
                related_entity: 'schedules',
                related_id: scheduleData.id
              });
              console.log('Notification sent to employee:', employee.user_id);
            } catch (notificationError) {
              console.error('Error sending notification:', notificationError);
            }
          }
        }

        sonnerToast.success('Shift created and assigned successfully');
        
        if (onResponseComplete) {
          onResponseComplete();
        }
      } catch (error) {
        console.error('Error adding shift:', error);
        sonnerToast.error('Failed to save shift');
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
