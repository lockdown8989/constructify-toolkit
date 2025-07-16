
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar } from 'lucide-react';
import { useShiftPatterns, useCreateShiftPattern, useUpdateShiftPattern, useDeleteShiftPattern } from '@/hooks/use-shift-patterns';
import { useEmployees } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { usePatternEmployees } from '../shift-patterns/hooks/usePatternEmployees';
import { useShiftPatternForm } from '../shift-patterns/hooks/useShiftPatternForm';
import { useAssignEmployeesToPattern } from '@/hooks/use-shift-pattern-assignments';
import { createAndConfirmRecurringRotas, batchApproveAllPendingRotas } from '@/services/rota-management/rota-auto-confirm';
import { ShiftTemplate } from '@/types/schedule';
import { RotaPatternCard } from './components/RotaPatternCard';
import { RotaPatternDialog } from './components/RotaPatternDialog';
import { RotaCalendarSync } from './components/RotaCalendarSync';

const RotaEmployeeManager = () => {
  const { data: shiftPatterns = [], isLoading, refetch: refetchPatterns } = useShiftPatterns();
  const { data: employees = [] } = useEmployees();
  const createPattern = useCreateShiftPattern();
  const updatePattern = useUpdateShiftPattern();
  const deletePattern = useDeleteShiftPattern();
  const assignEmployeesToPattern = useAssignEmployeesToPattern();
  const { toast } = useToast();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<ShiftTemplate | null>(null);
  const [syncingRotas, setSyncingRotas] = useState<string[]>([]);
  const [autoApprovingRotas, setAutoApprovingRotas] = useState(false);
  
  const { patternEmployees, refreshPatternEmployees } = usePatternEmployees(shiftPatterns as any);
  const {
    formData,
    setFormData,
    selectedEmployees,
    selectedEmployeeId,
    setSelectedEmployeeId,
    resetForm,
    loadPatternData,
    handleAddEmployee: formHandleAddEmployee,
    handleRemoveEmployee,
    loadExistingEmployeeAssignments,
  } = useShiftPatternForm();

  // Load existing employee assignments when editing a pattern
  useEffect(() => {
    if (editingPattern && patternEmployees[editingPattern.id]) {
      const assignedEmployeeIds = patternEmployees[editingPattern.id].map(emp => emp.id);
      loadExistingEmployeeAssignments(assignedEmployeeIds);
    }
  }, [editingPattern, patternEmployees, loadExistingEmployeeAssignments]);

  const handleCreate = () => {
    setEditingPattern(null);
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (pattern: ShiftTemplate) => {
    setEditingPattern(pattern);
    loadPatternData(pattern);
    setIsCreateModalOpen(true);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  // Enhanced handleAddEmployee with immediate database save
  const handleAddEmployee = async () => {
    console.log('RotaEmployeeManager handleAddEmployee called:', {
      selectedEmployeeId,
      selectedEmployees,
      employeesCount: employees.length,
      editingPattern: editingPattern?.id,
      availableEmployees: employees.filter(emp => 
        emp && emp.id && !selectedEmployees.includes(emp.id)
      ).length
    });

    if (!selectedEmployeeId) {
      console.error('No employee selected');
      toast({
        title: "No employee selected",
        description: "Please select an employee to add to the rota.",
        variant: "destructive",
      });
      return;
    }

    if (selectedEmployeeId === 'no-employees') {
      console.error('Invalid employee selection');
      toast({
        title: "Invalid selection",
        description: "Please select a valid employee.",
        variant: "destructive",
      });
      return;
    }

    if (selectedEmployees.includes(selectedEmployeeId)) {
      console.error('Employee already selected');
      toast({
        title: "Employee already added",
        description: "This employee is already assigned to this rota.",
        variant: "destructive",
      });
      return;
    }

    // Check if employee exists
    const employee = employees.find(emp => emp.id === selectedEmployeeId);
    if (!employee) {
      console.error('Employee not found');
      toast({
        title: "Employee not found",
        description: "The selected employee could not be found.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log('Adding employee:', employee.name);
      
      // If we're editing an existing pattern, save to database immediately
      if (editingPattern) {
        console.log('Saving employee assignment to database for pattern:', editingPattern.id);
        
        await assignEmployeesToPattern.mutateAsync({
          shiftPatternId: editingPattern.id,
          employeeIds: [selectedEmployeeId], // Single employee assignment
        });
        
        console.log('Employee assignment saved to database');
        
        // Trigger multiple refreshes to ensure UI updates
        setTimeout(() => refreshPatternEmployees(true), 100);
        setTimeout(() => refreshPatternEmployees(true), 500);
        setTimeout(() => refreshPatternEmployees(true), 1000);
      }
      
      // Add employee to the local state
      formHandleAddEmployee();
      
      // Clear the selection after adding
      setSelectedEmployeeId('');
      
      console.log('Employee added successfully:', employee.name);
      
      // Show immediate confirmation
      toast({
        title: "✅ Employee Added",
        description: `Successfully added ${employee.name} to the rota!`,
      });
      
    } catch (error) {
      console.error('Error adding employee:', error);
      toast({
        title: "Error",
        description: "Failed to add employee. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleAutoApproveAllRotas = async () => {
    setAutoApprovingRotas(true);
    
    try {
      const result = await batchApproveAllPendingRotas();
      
      if (result.success) {
        toast({
          title: "Rotas Auto-Approved",
          description: result.message || "All pending rota shifts have been automatically confirmed.",
        });
      } else {
        throw new Error('Failed to auto-approve rotas');
      }

    } catch (error) {
      console.error('Error auto-approving rotas:', error);
      toast({
        title: "Auto-approval failed",
        description: "Failed to auto-approve pending rotas. Please try again.",
        variant: "destructive",
      });
    } finally {
      setAutoApprovingRotas(false);
    }
  };

  const handleSyncToCalendar = async (patternId: string) => {
    setSyncingRotas(prev => [...prev, patternId]);
    
    try {
      const pattern = shiftPatterns.find(p => p.id === patternId);
      const assignedEmployees = patternEmployees[patternId] || [];
      
      if (!pattern || assignedEmployees.length === 0) {
        toast({
          title: "No employees assigned",
          description: "Please assign employees to this rota before syncing to calendar.",
          variant: "destructive",
        });
        return;
      }

      // Create and auto-confirm recurring schedules
      const result = await createAndConfirmRecurringRotas({
        employeeIds: assignedEmployees.map(emp => emp.id),
        shiftPatternId: patternId,
        patternName: pattern.name,
        startTime: pattern.start_time,
        endTime: pattern.end_time,
        weeksToGenerate: 12
      });

      if (result.success) {
        toast({
          title: "Rota synced successfully",
          description: `${pattern.name} has been synced to ${assignedEmployees.length} employee calendars for the next 12 weeks. All shifts are automatically confirmed and employees will be notified.`,
        });
      } else {
        throw new Error('Failed to sync rota');
      }

    } catch (error) {
      console.error('Error syncing rota to calendar:', error);
      toast({
        title: "Sync failed",
        description: "Failed to sync rota to employee calendars. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSyncingRotas(prev => prev.filter(id => id !== patternId));
    }
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

    // Validate that at least one employee is selected
    if (selectedEmployees.length === 0) {
      toast({
        title: "Warning",
        description: "No employees selected. The rota pattern will be created but no employees will be assigned.",
        variant: "destructive",
      });
    }

    try {
      if (editingPattern) {
        console.log('Updating existing pattern:', editingPattern.id);
        
        // Update the pattern first
        const updatedPattern = await updatePattern.mutateAsync({
          id: editingPattern.id,
          ...formData,
        });
        
        console.log('Pattern updated, now assigning employees:', selectedEmployees);
        
        // Assign employees to the pattern if any are selected
        if (selectedEmployees.length > 0) {
          await assignEmployeesToPattern.mutateAsync({
            shiftPatternId: editingPattern.id,
            employeeIds: selectedEmployees,
          });
          
          toast({
            title: "✅ Rota Updated Successfully",
            description: `Rota pattern updated and ${selectedEmployees.length} employee(s) assigned. All changes have been saved.`,
          });
        } else {
          toast({
            title: "✅ Rota Updated",
            description: "Rota pattern updated successfully.",
          });
        }
        
      } else {
        console.log('Creating new pattern with data:', formData);
        
        // Create new pattern
        const newPattern = await createPattern.mutateAsync(formData);
        
        console.log('New pattern created:', newPattern);
        
        // If we have selected employees, assign them to the new pattern
        if (selectedEmployees.length > 0 && newPattern) {
          console.log('Assigning employees to new pattern:', {
            patternId: newPattern.id,
            employeeIds: selectedEmployees
          });
          
          await assignEmployeesToPattern.mutateAsync({
            shiftPatternId: newPattern.id,
            employeeIds: selectedEmployees,
          });
          
          toast({
            title: "✅ Rota Created Successfully",
            description: `Rota pattern created and ${selectedEmployees.length} employee(s) assigned. Use "Sync to Calendar" to create confirmed shifts.`,
          });
        } else {
          toast({
            title: "✅ Rota Created",
            description: "Rota pattern created successfully. Assign employees and sync to calendar to create confirmed shifts.",
          });
        }
      }
      
      // Multiple refresh strategies to ensure data synchronization
      console.log('Starting comprehensive data refresh...');
      
      // 1. Immediate refresh
      await refreshPatternEmployees();
      
      // 2. Refetch shift patterns to get latest data
      await refetchPatterns();
      
      // 3. Additional refresh after short delay
      setTimeout(async () => {
        console.log('Secondary refresh of pattern employees');
        await refreshPatternEmployees();
      }, 1000);
      
      // 4. Final refresh to ensure UI synchronization
      setTimeout(async () => {
        console.log('Final refresh to ensure UI sync');
        await refreshPatternEmployees();
        await refetchPatterns();
      }, 2500);
      
      setIsCreateModalOpen(false);
      resetForm();
      setEditingPattern(null);
    } catch (error) {
      console.error('Error saving rota pattern:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      toast({
        title: "❌ Save Failed",
        description: `Failed to ${editingPattern ? 'update' : 'create'} rota pattern: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this rota pattern? This will not affect already created shifts.')) {
      try {
        await deletePattern.mutateAsync(id);
        
        // Comprehensive refresh after deletion
        await refreshPatternEmployees();
        await refetchPatterns();
        
        toast({
          title: "Success",
          description: "Rota pattern deleted successfully.",
        });
      } catch (error) {
        console.error('Error deleting rota pattern:', error);
        toast({
          title: "Error",
          description: "Failed to delete rota pattern. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const isDialogLoading = createPattern.isPending || updatePattern.isPending || assignEmployeesToPattern.isPending;

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p>Loading rota patterns...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
              <Users className="h-5 w-5" />
              Employee Rota Patterns
            </CardTitle>
            <div className="flex gap-2">
              <Button onClick={handleCreate} size="sm" className="self-start sm:self-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Rota
              </Button>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Create rota patterns and sync them to employee calendars. All rota shifts are automatically confirmed - no employee response needed.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {shiftPatterns.map((pattern) => (
              <RotaPatternCard
                key={pattern.id}
                pattern={pattern as any}
                assignedEmployees={patternEmployees[pattern.id] || []}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onSyncToCalendar={handleSyncToCalendar}
                isSyncing={syncingRotas.includes(pattern.id)}
              />
            ))}
            {shiftPatterns.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No rota patterns yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your first rota pattern to assign automatic schedules to employees.
                </p>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Rota
                </Button>
              </div>
            )}
          </div>

          <RotaPatternDialog
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            editingPattern={editingPattern}
            formData={formData}
            onFormDataChange={(data) => setFormData(data as any)}
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

      <RotaCalendarSync 
        shiftPatterns={shiftPatterns as any}
        patternEmployees={patternEmployees}
        onSyncAll={async () => {
          for (const pattern of shiftPatterns) {
            if (patternEmployees[pattern.id]?.length > 0) {
              await handleSyncToCalendar(pattern.id);
            }
          }
        }}
      />
    </div>
  );
};

export default RotaEmployeeManager;
