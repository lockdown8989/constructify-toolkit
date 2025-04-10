
import { useState } from 'react';
import { Shift } from '@/types/restaurant-schedule';
import ShiftEditDialog from './ShiftEditDialog';

interface ShiftDialogManagerProps {
  addShift: (shift: Omit<Shift, 'id'>) => void;
  updateShift: (shift: Shift) => void;
}

const ShiftDialogManager = ({ addShift, updateShift }: ShiftDialogManagerProps) => {
  const [isShiftDialogOpen, setIsShiftDialogOpen] = useState(false);
  const [currentShift, setCurrentShift] = useState<Shift | undefined>(undefined);
  const [newShiftEmployeeId, setNewShiftEmployeeId] = useState<string | null>(null);
  const [newShiftDay, setNewShiftDay] = useState<string | null>(null);

  const handleEditShift = (shift: Shift) => {
    setCurrentShift(shift);
    setIsShiftDialogOpen(true);
  };

  const handleAddShift = (employeeId: string, day: string) => {
    setNewShiftEmployeeId(employeeId);
    setNewShiftDay(day);
    
    // Create a default new shift
    const newShift: Shift = {
      id: '',
      employeeId,
      day,
      startTime: '09:00',
      endTime: '17:00',
      role: '', // This will be set from the employee's role in the parent component
      hasBreak: false,
      isUnavailable: false
    };
    
    setCurrentShift(newShift);
    setIsShiftDialogOpen(true);
  };

  const handleSaveShift = (shift: Shift) => {
    if (shift.id) {
      // Update existing shift
      updateShift(shift);
    } else {
      // Add new shift with specific employee and day
      const newShift = {
        ...shift,
        employeeId: newShiftEmployeeId || '',
        day: newShiftDay || ''
      };
      
      addShift(newShift);
    }
    
    // Reset state
    closeDialog();
  };

  const closeDialog = () => {
    setIsShiftDialogOpen(false);
    setCurrentShift(undefined);
    setNewShiftEmployeeId(null);
    setNewShiftDay(null);
  };

  return {
    isShiftDialogOpen,
    currentShift,
    handleEditShift,
    handleAddShift,
    handleSaveShift,
    closeDialog,
    ShiftDialogComponent: (
      <ShiftEditDialog
        isOpen={isShiftDialogOpen}
        onClose={closeDialog}
        shift={currentShift}
        onSave={handleSaveShift}
      />
    )
  };
};

export default ShiftDialogManager;
