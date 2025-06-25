
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Clock } from 'lucide-react';
import { useShiftPatterns, useCreateShiftPattern, useUpdateShiftPattern, useDeleteShiftPattern } from '@/hooks/use-shift-patterns';
import { useEmployees } from '@/hooks/use-employees';
import { useCreateRecurringSchedules } from '@/hooks/use-recurring-schedules';
import { ShiftPattern } from '@/types/shift-patterns';
import { useToast } from '@/hooks/use-toast';
import { usePatternEmployees } from './hooks/usePatternEmployees';
import { useShiftPatternForm } from './hooks/useShiftPatternForm';
import { ShiftPatternCard } from './components/ShiftPatternCard';
import { ShiftPatternDialog } from './components/ShiftPatternDialog';

const ShiftPatternManager = () => {
  const { data: shiftPatterns = [], isLoading } = useShiftPatterns();
  const { data: employees = [] } = useEmployees();
  const createPattern = useCreateShiftPattern();
  const updatePattern = useUpdateShiftPattern();
  const deletePattern = useDeleteShiftPattern();
  const createRecurringSchedules = useCreateRecurringSchedules();
  const { toast } = useToast();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<ShiftPattern | null>(null);
  
  const { patternEmployees, refreshPatternEmployees } = usePatternEmployees(shiftPatterns);
  const {
    formData,
    setFormData,
    selectedEmployees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    resetForm,
    loadPatternData,
    handleAddEmployee,
    handleRemoveEmployee,
  } = useShiftPatternForm();

  const handleCreate = () => {
    setEditingPattern(null);
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (pattern: ShiftPattern) => {
    setEditingPattern(pattern);
    loadPatternData(pattern);
    setIsCreateModalOpen(true);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.start_time || !formData.end_time) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingPattern) {
        console.log('Updating pattern with data:', formData);
        console.log('Selected employees for assignment:', selectedEmployees);
        
        // Update the pattern first
        const updatedPattern = await updatePattern.mutateAsync({
          id: editingPattern.id,
          ...formData,
        });
        
        console.log('Pattern updated successfully:', updatedPattern);
        
        // Create recurring schedules for assigned employees if any are selected
        if (selectedEmployees.length > 0) {
          console.log('Creating recurring schedules for employees:', selectedEmployees);
          
          try {
            await createRecurringSchedules.mutateAsync({
              employeeIds: selectedEmployees,
              shiftPatternId: editingPattern.id,
              patternName: formData.name,
              startTime: formData.start_time,
              endTime: formData.end_time,
              weeksToGenerate: 12
            });
            
            // Manually refresh pattern employees after successful assignment
            setTimeout(() => {
              refreshPatternEmployees();
            }, 1000);
            
            toast({
              title: "Success",
              description: `Shift pattern updated and assigned to ${selectedEmployees.length} employee(s). Schedules created for the next 12 weeks.`,
            });
          } catch (scheduleError) {
            console.error('Error creating recurring schedules:', scheduleError);
            toast({
              title: "Pattern Updated",
              description: "Shift pattern updated, but there was an issue creating the recurring schedules. Please try assigning employees again.",
              variant: "destructive",
            });
          }
        } else {
          toast({
            title: "Success",
            description: "Shift pattern updated successfully.",
          });
        }
      } else {
        // Create new pattern
        console.log('Creating new pattern with data:', formData);
        
        const newPattern = await createPattern.mutateAsync(formData);
        
        console.log('Pattern created successfully:', newPattern);
        
        toast({
          title: "Success",
          description: "Shift pattern created successfully.",
        });
      }
      
      setIsCreateModalOpen(false);
      resetForm();
      setEditingPattern(null);
    } catch (error) {
      console.error('Error saving shift pattern:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingPattern ? 'update' : 'create'} shift pattern. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this shift pattern?')) {
      try {
        await deletePattern.mutateAsync(id);
        // Refresh pattern employees after deletion
        refreshPatternEmployees();
      } catch (error) {
        console.error('Error deleting shift pattern:', error);
      }
    }
  };

  const isDialogLoading = createPattern.isPending || updatePattern.isPending || createRecurringSchedules.isPending;

  if (isLoading) {
    return <div className="p-4">Loading shift patterns...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Clock className="h-5 w-5" />
            Shift Patterns
          </CardTitle>
          <Button onClick={handleCreate} size="sm" className="self-start sm:self-auto">
            <Plus className="h-4 w-4 mr-2" />
            Add Pattern
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          {shiftPatterns.map((pattern) => (
            <ShiftPatternCard
              key={pattern.id}
              pattern={pattern}
              assignedEmployees={patternEmployees[pattern.id] || []}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
          {shiftPatterns.length === 0 && (
            <p className="text-center text-gray-500 py-8 text-sm sm:text-base">
              No shift patterns created yet. Add your first pattern to get started.
            </p>
          )}
        </div>

        <ShiftPatternDialog
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          editingPattern={editingPattern}
          formData={formData}
          onFormDataChange={setFormData}
          employees={employees}
          selectedEmployees={selectedEmployees}
          selectedEmployeeId={selectedEmployeeId}
          onEmployeeIdChange={setSelectedEmployeeId}
          onAddEmployee={handleAddEmployee}
          onRemoveEmployee={handleRemoveEmployee}
          getEmployeeName={getEmployeeName}
          onSubmit={handleSubmit}
          isLoading={isDialogLoading}
        />
      </CardContent>
    </Card>
  );
};

export default ShiftPatternManager;
