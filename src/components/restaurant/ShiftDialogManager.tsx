
import React, { useState } from 'react';
import { Shift } from '@/types/restaurant-schedule';
import ShiftEditDialog from './ShiftEditDialog';
import { sendNotification } from '@/services/notifications/notification-sender';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { toast as sonnerToast } from 'sonner';
import { useCreateSchedule } from '@/hooks/use-schedules';

interface ShiftDialogManagerProps {
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (shift: Shift) => void;
}

const ShiftDialogManager = ({ addShift, updateShift }: ShiftDialogManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const { user } = useAuth();
  const { createSchedule } = useCreateSchedule();

  const handleAddShift = (employeeId: string, day: string) => {
    setMode('add');
    setEmployeeId(employeeId);
    setDay(day);
    setIsOpen(true);
  };

  const handleEditShift = (shift: Shift) => {
    setMode('edit');
    setCurrentShift(shift);
    setIsOpen(true);
  };

  const handleFormSubmit = async (formData: any) => {
    if (mode === 'add' && employeeId && day) {
      const newShift = {
        employeeId,
        day,
        ...formData
      };
      
      // Add to local state for UI update
      addShift(newShift);

      try {
        // Get employee data to check for user_id
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('user_id, name')
          .eq('id', employeeId)
          .single();

        if (employeeError) {
          console.error('Failed to get employee data:', employeeError);
          throw employeeError;
        }

        if (!employeeData.user_id) {
          console.error('Employee has no user_id, cannot send notification');
        } else {
          // Create actual schedule in database
          const startHour = formData.startTime || '09:00';
          const endHour = formData.endTime || '17:00';
          
          // Create date from day string
          let startDate = new Date();
          const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
          const targetDayIndex = weekdays.indexOf(day.toLowerCase());
          
          if (targetDayIndex !== -1) {
            const currentDayIndex = startDate.getDay();
            const daysToAdd = (targetDayIndex - currentDayIndex + 7) % 7;
            startDate.setDate(startDate.getDate() + daysToAdd);
          }
          
          // Format start and end times for database
          const startDateTime = new Date(startDate);
          const [startHours, startMinutes] = startHour.split(':').map(Number);
          startDateTime.setHours(startHours, startMinutes, 0, 0);
          
          const endDateTime = new Date(startDate);
          const [endHours, endMinutes] = endHour.split(':').map(Number);
          endDateTime.setHours(endHours, endMinutes, 0, 0);
          
          // Create schedule in database
          const scheduleData = {
            employee_id: employeeId,
            title: formData.role || 'Shift',
            start_time: startDateTime.toISOString(),
            end_time: endDateTime.toISOString(),
            notes: formData.notes || '',
            status: 'confirmed',
            location: formData.location || ''
          };
          
          // Add to database
          createSchedule(scheduleData);
          
          // Send notification to the employee
          sendNotification({
            user_id: employeeData.user_id,
            title: "New Shift Assigned",
            message: `You have been assigned a new ${formData.role || ''} shift on ${day} from ${startHour} to ${endHour}`,
            type: "info",
            related_entity: "schedule",
            related_id: Date.now().toString()
          });
          
          sonnerToast.success(`Shift assigned to ${employeeData.name}`);
        }
      } catch (error) {
        console.error('Error adding shift to database:', error);
        sonnerToast.error('Failed to save shift to database');
      }
    } else if (mode === 'edit' && currentShift) {
      const updatedShift = {
        ...currentShift,
        ...formData
      };
      
      updateShift(updatedShift);

      // If the shift details changed, update in database and notify the employee
      try {
        const { data: employeeData, error: employeeError } = await supabase
          .from('employees')
          .select('user_id, name')
          .eq('id', currentShift.employeeId)
          .single();

        if (employeeError) {
          console.error('Failed to get employee data for notification:', employeeError);
        } else if (employeeData.user_id) {
          // If the shift details changed, notify the employee
          if (
            currentShift.startTime !== formData.startTime || 
            currentShift.endTime !== formData.endTime ||
            currentShift.day !== formData.day
          ) {
            sendNotification({
              user_id: employeeData.user_id,
              title: "Shift Updated",
              message: `Your shift on ${currentShift.day} has been updated from ${formData.startTime} to ${formData.endTime}`,
              type: "info",
              related_entity: "schedule",
              related_id: currentShift.id
            });
          }
        }
      } catch (error) {
        console.error('Error updating shift:', error);
      }
    }
    
    setIsOpen(false);
  };

  const ShiftDialogComponent = (
    <ShiftEditDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSave={handleFormSubmit}
      mode={mode}
      shift={currentShift}
    />
  );

  return {
    handleAddShift,
    handleEditShift,
    ShiftDialogComponent
  };
};

export default ShiftDialogManager;
