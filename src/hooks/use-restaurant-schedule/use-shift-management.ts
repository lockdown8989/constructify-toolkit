
import { useState } from 'react';
import { Shift, OpenShift, Employee } from '@/types/restaurant-schedule';
import { useToast } from '@/hooks/use-toast';

export const useShiftManagement = (employees: Employee[]) => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [openShifts, setOpenShifts] = useState<OpenShift[]>([]);
  
  const { toast } = useToast();

  // Function to add a new shift
  const addShift = (newShift: Omit<Shift, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const shift: Shift = { ...newShift, id };
    
    setShifts(prevShifts => [...prevShifts, shift]);
    
    toast({
      title: "Shift added",
      description: `New shift added for ${employees.find(e => e.id === newShift.employeeId)?.name || 'employee'}`,
    });
  };

  // Function to update a shift
  const updateShift = (updatedShift: Shift) => {
    setShifts(prevShifts => 
      prevShifts.map(shift => 
        shift.id === updatedShift.id ? updatedShift : shift
      )
    );
    
    toast({
      title: "Shift updated",
      description: "The shift has been updated successfully",
    });
  };

  // Function to remove a shift
  const removeShift = (shiftId: string) => {
    setShifts(prevShifts => prevShifts.filter(shift => shift.id !== shiftId));
    
    toast({
      title: "Shift removed",
      description: "The shift has been removed successfully",
    });
  };

  // Function to add a new open shift
  const addOpenShift = (newOpenShift: Omit<OpenShift, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const openShift: OpenShift = { ...newOpenShift, id };
    
    setOpenShifts(prevOpenShifts => [...prevOpenShifts, openShift]);
    
    toast({
      title: "Open shift added",
      description: `New open shift added for ${newOpenShift.role}`,
    });
  };

  // Function to assign an open shift to an employee
  const assignOpenShift = (openShiftId: string, employeeId?: string) => {
    if (!employeeId) {
      toast({
        title: "Assignment failed",
        description: "No employee selected for assignment",
        variant: "destructive"
      });
      return;
    }
    
    const openShift = openShifts.find(shift => shift.id === openShiftId);
    const employee = employees.find(e => e.id === employeeId);
    
    if (!openShift) {
      toast({
        title: "Assignment failed",
        description: "Open shift not found",
        variant: "destructive"
      });
      return;
    }
    
    if (!employee) {
      toast({
        title: "Assignment failed",
        description: "Employee not found",
        variant: "destructive"
      });
      return;
    }
    
    // Create a new shift for the employee
    const newShift: Omit<Shift, 'id'> = {
      employeeId,
      day: openShift.day,
      startTime: openShift.startTime,
      endTime: openShift.endTime,
      role: openShift.role,
      notes: openShift.notes
    };
    
    addShift(newShift);
    
    // Remove the open shift
    setOpenShifts(prevOpenShifts => 
      prevOpenShifts.filter(shift => shift.id !== openShiftId)
    );
    
    toast({
      title: "Shift assigned",
      description: `Open shift assigned to ${employee.name}`,
    });
  };

  return {
    shifts,
    openShifts,
    addShift,
    updateShift,
    removeShift,
    addOpenShift,
    assignOpenShift
  };
};
