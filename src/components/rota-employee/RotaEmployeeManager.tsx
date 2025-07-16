
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
import { ShiftPattern } from '@/types/shift-patterns';
import { RotaPatternCard } from './components/RotaPatternCard';
import { RotaPatternDialog } from './components/RotaPatternDialog';
import { RotaCalendarSync } from './components/RotaCalendarSync';

const RotaEmployeeManager = () => {
  const { data: shiftPatterns = [], isLoading } = useShiftPatterns();
  const { data: employees = [] } = useEmployees();
  const createPattern = useCreateShiftPattern();
  const updatePattern = useUpdateShiftPattern();
  const deletePattern = useDeleteShiftPattern();
  const assignEmployeesToPattern = useAssignEmployeesToPattern();
  const { toast } = useToast();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<ShiftPattern | null>(null);
  const [syncingRotas, setSyncingRotas] = useState<string[]>([]);
  const [autoApprovingRotas, setAutoApprovingRotas] = useState(false);
  
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

  const handleEdit = (pattern: ShiftPattern) => {
    setEditingPattern(pattern);
    loadPatternData(pattern);
    setIsCreateModalOpen(true);
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Unknown Employee';
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

    try {
      if (editingPattern) {
        // Update the pattern first
        const updatedPattern = await updatePattern.mutateAsync({
          id: editingPattern.id,
          ...formData,
        });
        
        // Assign employees to the pattern
        await assignEmployeesToPattern.mutateAsync({
          shiftPatternId: editingPattern.id,
          employeeIds: selectedEmployees,
        });
        
        toast({
          title: "Success",
          description: `Rota pattern updated and assigned to ${selectedEmployees.length} employee(s).`,
        });
        
        // Refresh pattern employees after successful assignment
        setTimeout(() => {
          refreshPatternEmployees();
        }, 1000);
        
      } else {
        // Create new pattern
        const newPattern = await createPattern.mutateAsync(formData);
        
        // If we have selected employees, assign them to the new pattern
        if (selectedEmployees.length > 0 && newPattern) {
          await assignEmployeesToPattern.mutateAsync({
            shiftPatternId: newPattern.id,
            employeeIds: selectedEmployees,
          });
          
          toast({
            title: "Success",
            description: `Rota pattern created and assigned to ${selectedEmployees.length} employee(s). Use "Sync to Calendar" to create confirmed shifts for employees.`,
          });
          
          // Refresh pattern employees after successful assignment
          setTimeout(() => {
            refreshPatternEmployees();
          }, 1000);
        } else {
          toast({
            title: "Success",
            description: "Rota pattern created successfully. Assign employees and sync to calendar to create confirmed shifts.",
          });
        }
      }
      
      setIsCreateModalOpen(false);
      resetForm();
      setEditingPattern(null);
    } catch (error) {
      console.error('Error saving rota pattern:', error);
      toast({
        title: "Error",
        description: `Failed to ${editingPattern ? 'update' : 'create'} rota pattern. Please try again.`,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this rota pattern? This will not affect already created shifts.')) {
      try {
        await deletePattern.mutateAsync(id);
        refreshPatternEmployees();
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
                pattern={pattern}
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

      <RotaCalendarSync 
        shiftPatterns={shiftPatterns}
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
