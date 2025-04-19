
import { useState } from 'react';
import { Shift } from '@/types/restaurant-schedule';

export const useShiftDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'add' | 'edit'>('add');
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [day, setDay] = useState<string | null>(null);

  const openAddShiftDialog = (employeeId: string, day: string) => {
    setMode('add');
    setEmployeeId(employeeId);
    setDay(day);
    setIsOpen(true);
  };

  const openEditShiftDialog = (shift: Shift) => {
    setMode('edit');
    setCurrentShift(shift);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setIsOpen(false);
    setCurrentShift(null);
    setEmployeeId(null);
    setDay(null);
  };

  return {
    isOpen,
    mode,
    currentShift,
    employeeId,
    day,
    openAddShiftDialog,
    openEditShiftDialog,
    closeDialog,
    setCurrentShift,
    setMode
  };
};
