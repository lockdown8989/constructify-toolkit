
import { useState } from 'react';
import { ShiftPattern } from '@/types/shift-patterns';

interface FormData {
  name: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  grace_period_minutes: number;
  overtime_threshold_minutes: number;
}

export const useShiftPatternForm = () => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    start_time: '',
    end_time: '',
    break_duration: 30,
    grace_period_minutes: 15,
    overtime_threshold_minutes: 15,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      start_time: '',
      end_time: '',
      break_duration: 30,
      grace_period_minutes: 15,
      overtime_threshold_minutes: 15,
    });
    setSelectedEmployees([]);
    setSelectedEmployeeId('');
  };

  const loadPatternData = (pattern: ShiftPattern) => {
    setFormData({
      name: pattern.name,
      start_time: pattern.start_time,
      end_time: pattern.end_time,
      break_duration: pattern.break_duration,
      grace_period_minutes: pattern.grace_period_minutes,
      overtime_threshold_minutes: pattern.overtime_threshold_minutes,
    });
    // Reset selected employees - they will be loaded from the pattern employees data
    setSelectedEmployees([]);
    setSelectedEmployeeId('');
  };

  const handleAddEmployee = () => {
    console.log('useShiftPatternForm handleAddEmployee called:', {
      selectedEmployeeId,
      currentSelectedEmployees: selectedEmployees,
      isAlreadySelected: selectedEmployees.includes(selectedEmployeeId)
    });
    
    if (selectedEmployeeId && selectedEmployeeId.trim() !== '' && !selectedEmployees.includes(selectedEmployeeId)) {
      console.log('Adding employee to selectedEmployees:', selectedEmployeeId);
      setSelectedEmployees(prev => {
        const newList = [...prev, selectedEmployeeId];
        console.log('Updated selectedEmployees:', newList);
        return newList;
      });
      
      // Clear the selection after adding
      console.log('Clearing selectedEmployeeId');
      setSelectedEmployeeId('');
    } else {
      console.log('Employee not added - conditions not met:', {
        hasSelectedEmployeeId: !!selectedEmployeeId,
        isNotEmpty: selectedEmployeeId?.trim() !== '',
        isNotAlreadySelected: !selectedEmployees.includes(selectedEmployeeId)
      });
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    console.log('Removing employee:', employeeId);
    setSelectedEmployees(prev => {
      const newList = prev.filter(id => id !== employeeId);
      console.log('New selectedEmployees list after removal:', newList);
      return newList;
    });
  };

  // New function to load existing employee assignments
  const loadExistingEmployeeAssignments = (employeeIds: string[]) => {
    console.log('Loading existing employee assignments:', employeeIds);
    setSelectedEmployees(employeeIds);
  };

  return {
    formData,
    setFormData,
    selectedEmployees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    resetForm,
    loadPatternData,
    handleAddEmployee,
    handleRemoveEmployee,
    loadExistingEmployeeAssignments,
  };
};
