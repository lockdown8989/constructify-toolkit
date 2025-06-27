
import { useState } from 'react';
import { ShiftPattern } from '@/types/shift-patterns';

export const useShiftPatternForm = () => {
  const [formData, setFormData] = useState({
    name: '',
    start_time: '09:00',
    end_time: '17:00',
    break_duration: 30,
    grace_period_minutes: 15,
    overtime_threshold_minutes: 15,
  });
  
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      start_time: '09:00',
      end_time: '17:00',
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
  };

  const handleAddEmployee = () => {
    if (selectedEmployeeId && !selectedEmployees.includes(selectedEmployeeId)) {
      setSelectedEmployees([...selectedEmployees, selectedEmployeeId]);
      setSelectedEmployeeId('');
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees(selectedEmployees.filter(id => id !== employeeId));
  };

  const loadExistingEmployeeAssignments = (employeeIds: string[]) => {
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
