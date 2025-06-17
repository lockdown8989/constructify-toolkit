
import { useState } from 'react';
import { Shift } from '@/types/restaurant-schedule';

export type ShiftDialogMode = 'add' | 'edit';

export const useShiftDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<ShiftDialogMode>('add');
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [employeeId, setEmployeeId] = useState<string>('');
  const [day, setDay] = useState<string>('');

  const openAddDialog = (empId: string, dayName: string) => {
    console.log('Opening add dialog for employee:', empId, 'day:', dayName);
    setEmployeeId(empId);
    setDay(dayName);
    setMode('add');
    setEditingShift(null);
    setIsOpen(true);
  };

  const openEditDialog = (shift: Shift) => {
    console.log('Opening edit dialog for shift:', shift);
    setEditingShift(shift);
    setEmployeeId(shift.employeeId);
    setDay(shift.day);
    setMode('edit');
    setIsOpen(true);
  };

  const closeDialog = () => {
    console.log('Closing shift dialog');
    setIsOpen(false);
    setEditingShift(null);
    setEmployeeId('');
    setDay('');
  };

  return {
    isOpen,
    mode,
    editingShift,
    employeeId,
    day,
    openAddDialog,
    openEditDialog,
    closeDialog
  };
};
