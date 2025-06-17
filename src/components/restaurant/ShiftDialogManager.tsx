
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
        console.log('Creating shift for employee:', shiftDialog.employeeId, 'on day:', shiftDialog.day);
        
        // Get current week start date
        const today = new Date();
        const currentWeekStart = new Date(today);
        currentWeekStart.setDate(today.getDate() - today.getDay()); // Start of current week (Sunday)
        
        // Calculate target date based on day
        const dayMap: Record<string, number> = {
          monday: 1, tuesday: 2, wednesday: 3, thursday: 4, 
          friday: 5, saturday: 6, sunday: 0
        };
        
        const targetDayOfWeek = dayMap[shiftDialog.day.toLowerCase()];
        const targetDate = new Date(currentWeekStart);
        targetDate.setDate(currentWeekStart.getDate() + targetDayOfWeek);
        
        // If the target date is in the past, move to next week
        if (targetDate < today) {
          targetDate.setDate(targetDate.getDate() + 7);
        }
        
        // Parse start and end times
        const [startHour, startMinute] = formData.startTime.split(':').map(Number);
        const [endHour, endMinute] = formData.endTime.split(':').map(Number);
        
        const startDateTime = new Date(targetDate);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        
        const endDateTime = new Date(targetDate);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        
        // If end time is before start time, assume it's next day
        if (endDateTime <= startDateTime) {
          endDateTime.setDate(endDateTime.getDate() + 1);
        }

        console.log('Creating schedule entry:', {
          employee_id: shiftDialog.employeeId,
          title: formData.role || 'Shift',
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          notes: formData.notes,
          location: formData.location,
          status: 'confirmed',
          published: true
        });

        // Create the schedule entry in the database
        const { data: scheduleData, error } = await supabase
          .from('schedules')
          .insert({
            employee_id: shiftDialog.employeeId,
            title: formData.role || 'Shift',
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            notes: formData.notes || null,
            location: formData.location || null,
            status: 'confirmed',
            published: true,
            created_platform: 'desktop',
            last_modified_platform: 'desktop',
            is_draft: false,
            can_be_edited: true
          })
          .select()
          .single();

        if (error) {
          console.error('Error creating schedule:', error);
          throw new Error(`Failed to create schedule: ${error.message}`);
        }

        console.log('Schedule created successfully:', scheduleData);

        // Also add to local state for immediate UI update
        const localShift: Omit<Shift, 'id'> = {
          employeeId: shiftDialog.employeeId,
          day: shiftDialog.day,
          startTime: formData.startTime,
          endTime: formData.endTime,
          role: formData.role || 'Staff',
          notes: formData.notes
        };

        addShift(localShift);

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

        updateShift(updatedShift);
        
        sonnerToast.success('Shift updated successfully');
        shiftDialog.closeDialog();
      } catch (error) {
        console.error('Error updating shift:', error);
        sonnerToast.error('Failed to update shift');
      }
    }
  };

  const ShiftDialogComponent = (
    <ShiftEditDialog
      isOpen={shiftDialog.isOpen}
      onClose={shiftDialog.closeDialog}
      onSubmit={handleFormSubmit}
      shift={shiftDialog.editingShift}
      mode={shiftDialog.mode}
      isLoading={isCreating}
      employeeId={shiftDialog.employeeId}
      day={shiftDialog.day}
    />
  );

  return {
    handleAddShift: shiftDialog.openAddDialog,
    handleEditShift: shiftDialog.openEditDialog,
    ShiftDialogComponent
  };
};

export default ShiftDialogManager;
