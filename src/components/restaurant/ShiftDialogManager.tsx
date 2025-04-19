
import React, { useState } from 'react';
import { Shift } from '@/types/restaurant-schedule';
import ShiftEditDialog from './ShiftEditDialog';
import { sendNotification } from '@/services/notifications/notification-sender';
import { useAuth } from '@/hooks/use-auth';

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

  const handleFormSubmit = (formData: any) => {
    if (mode === 'add' && employeeId && day) {
      const newShift = {
        employeeId,
        day,
        ...formData
      };
      
      addShift(newShift);

      // Send notification to the employee about the new shift
      if (user && formData.employeeId) {
        sendNotification({
          user_id: formData.employeeId,
          title: "New Shift Assigned",
          message: `You have been assigned a new shift on ${day} from ${formData.startTime} to ${formData.endTime}`,
          type: "info",
          related_entity: "schedule",
          related_id: Date.now().toString()
        });
      }
    } else if (mode === 'edit' && currentShift) {
      const updatedShift = {
        ...currentShift,
        ...formData
      };
      
      updateShift(updatedShift);

      // If the shift details changed, notify the employee
      if (
        currentShift.startTime !== formData.startTime || 
        currentShift.endTime !== formData.endTime ||
        currentShift.day !== formData.day
      ) {
        sendNotification({
          user_id: currentShift.employeeId,
          title: "Shift Updated",
          message: `Your shift on ${currentShift.day} has been updated from ${formData.startTime} to ${formData.endTime}`,
          type: "info",
          related_entity: "schedule",
          related_id: currentShift.id
        });
      }
    }
    
    setIsOpen(false);
  };

  const ShiftDialogComponent = (
    <ShiftEditDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      onSave={handleFormSubmit} // Changed onSubmit to onSave to match the component props
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
