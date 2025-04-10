
import { useState } from 'react';
import { Shift, OpenShift, Employee } from '@/types/restaurant-schedule';
import { useToast } from '@/hooks/use-toast';

export const useShiftManagement = (employees: Employee[]) => {
  const [shifts, setShifts] = useState<Shift[]>([
    { id: '1', employeeId: '1', day: 'monday', startTime: '07:00', endTime: '12:00', role: 'Kitchen Manager' },
    { id: '2', employeeId: '1', day: 'tuesday', startTime: '16:00', endTime: '23:00', role: 'Kitchen Manager' },
    { id: '3', employeeId: '2', day: 'monday', startTime: '12:00', endTime: '23:00', role: 'Head Chef' },
    { id: '4', employeeId: '2', day: 'tuesday', startTime: '07:00', endTime: '12:00', role: 'Head Chef' },
    { id: '5', employeeId: '3', day: 'monday', startTime: '16:00', endTime: '22:30', role: 'Chef', hasBreak: true, breakDuration: 30 },
    { id: '6', employeeId: '3', day: 'tuesday', startTime: '08:00', endTime: '18:00', role: 'Chef', isUnavailable: true, unavailabilityReason: 'vacation' },
    { id: '7', employeeId: '4', day: 'monday', startTime: '07:00', endTime: '12:00', role: 'Waiting Staff' },
    { id: '8', employeeId: '4', day: 'tuesday', startTime: '08:00', endTime: '18:00', role: 'Waiting Staff', isUnavailable: true, unavailabilityReason: 'vacation' },
  ]);
  
  const [openShifts, setOpenShifts] = useState<OpenShift[]>([
    { id: '1', day: 'monday', startTime: '16:00', endTime: '23:00', role: 'Bar Staff' },
    { id: '2', day: 'tuesday', startTime: '07:00', endTime: '19:00', role: 'Waiting Staff' },
  ]);
  
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
  const assignOpenShift = (openShiftId: string, employeeId: string) => {
    const openShift = openShifts.find(shift => shift.id === openShiftId);
    
    if (openShift) {
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
        description: `Open shift assigned to ${employees.find(e => e.id === employeeId)?.name || 'employee'}`,
      });
    }
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
