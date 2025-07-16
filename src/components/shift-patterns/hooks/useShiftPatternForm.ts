
import { useState } from 'react';
import { ShiftTemplate } from '@/types/schedule';
import { ShiftPatternFormData } from '../components/ShiftPatternDialog';

export const useShiftPatternForm = () => {
  const [formData, setFormData] = useState<ShiftPatternFormData>({
    name: '',
    start_time: '09:00',
    end_time: '17:00',
    break_duration: 30,
    days_of_week: [1, 2, 3, 4, 5] as number[], // Monday to Friday by default
    requirements: {},
    role: undefined as string | undefined,
    location: undefined as string | undefined,
  });
  
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');

  const resetForm = () => {
    setFormData({
      name: '',
      start_time: '09:00',
      end_time: '17:00',
      break_duration: 30,
      days_of_week: [1, 2, 3, 4, 5],
      requirements: {},
      role: undefined as string | undefined,
      location: undefined as string | undefined,
    });
    setSelectedEmployees([]);
    setSelectedEmployeeId('');
  };

  const loadPatternData = (pattern: ShiftTemplate) => {
    setFormData({
      name: pattern.name,
      start_time: pattern.start_time,
      end_time: pattern.end_time,
      break_duration: pattern.break_duration || 30,
      days_of_week: pattern.days_of_week || [1, 2, 3, 4, 5],
      requirements: pattern.requirements || {},
      role: pattern.role,
      location: pattern.location,
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
