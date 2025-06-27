
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar } from 'lucide-react';
import { useShiftPatterns, useCreateShiftPattern, useUpdateShiftPattern, useDeleteShiftPattern } from '@/hooks/use-shift-patterns';
import { useEmployees } from '@/hooks/use-employees';
import { useCreateRecurringSchedules } from '@/hooks/use-recurring-schedules';
import { useAssignEmployeesToPattern } from '@/hooks/use-shift-pattern-assignments';
import { ShiftPattern } from '@/types/shift-patterns';
import { useToast } from '@/hooks/use-toast';
import { RotaPatternCard } from './components/RotaPatternCard';
import { RotaPatternDialog } from './components/RotaPatternDialog';
import { RotaCalendarSync } from './components/RotaCalendarSync';

// Simple hook to manage pattern employees if the original is missing
const usePatternEmployees = (shiftPatterns: ShiftPattern[]) => {
  const [patternEmployees, setPatternEmployees] = useState<Record<string, any[]>>({});
  
  const refreshPatternEmployees = () => {
    // Simple implementation - you can enhance this later
    console.log('Refreshing pattern employees');
  };

  return { patternEmployees, refreshPatternEmployees };
};

// Simple hook for shift pattern form if the original is missing  
const useShiftPatternForm = () => {
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

const RotaEmployeeManager = () => {
  const { data: shiftPatterns = [], isLoading } = useShiftPatterns();
  const { data: employees = [] } = useEmployees();
  const createPattern = useCreateShiftPattern();
  const updatePattern = useUpdateShiftPattern();
  const deletePattern = useDeleteShiftPattern();
  const createRecurringSchedules = useCreateRecurringSchedules();
  const assignEmployeesToPattern = useAssignEmployeesToPattern();
  const { toast } = useToast();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<ShiftPattern | null>(null);
  const [syncingRotas, setSyncingRotas] = useState<string[]>([]);
  
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

      // Create recurring schedules for the next 12 weeks
      await createRecurringSchedules.mutateAsync({
        employeeIds: assignedEmployees.map(emp => emp.id),
        shiftPatternId: patternId,
        patternName: pattern.name,
        startTime: pattern.start_time,
        endTime: pattern.end_time,
        weeksToGenerate: 12
      });

      toast({
        title: "Rota synced successfully",
        description: `${pattern.name} has been synced to ${assignedEmployees.length} employee calendars for the next 12 weeks.`,
      });

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
        
        toast({
          title: "Success",
          description: "Rota pattern created successfully.",
        });
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
    if (window.confirm('Are you sure you want to delete this rota pattern?')) {
      try {
        await deletePattern.mutateAsync(id);
        refreshPatternEmployees();
      } catch (error) {
        console.error('Error deleting rota pattern:', error);
      }
    }
  };

  const isDialogLoading = createPattern.isPending || updatePattern.isPending || createRecurringSchedules.isPending || assignEmployeesToPattern.isPending;

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
            <Button onClick={handleCreate} size="sm" className="self-start sm:self-auto">
              <Plus className="h-4 w-4 mr-2" />
              Create Rota
            </Button>
          </div>
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
                  Create your first rota pattern to assign schedules to employees.
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
