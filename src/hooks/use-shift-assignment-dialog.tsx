
import { useState } from 'react';
import { useOpenShifts } from '@/hooks/use-open-shifts';
import { useEmployees } from '@/hooks/use-employees';
import { OpenShiftType } from '@/types/supabase/schedules';

export const useShiftAssignmentDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<OpenShiftType | null>(null);
  const { assignShift } = useOpenShifts();
  const { data: employees } = useEmployees();

  const openDialog = (shift: OpenShiftType) => {
    setSelectedShift(shift);
    setIsOpen(true);
  };

  const closeDialog = () => {
    setSelectedShift(null);
    setIsOpen(false);
  };

  const handleAssign = async (employeeId: string) => {
    if (!selectedShift) return;

    try {
      await assignShift.mutateAsync({
        openShiftId: selectedShift.id,
        employeeId
      });
      closeDialog();
    } catch (error) {
      console.error('Error assigning shift:', error);
    }
  };

  return {
    isOpen,
    selectedShift,
    employees,
    openDialog,
    closeDialog,
    handleAssign
  };
};
