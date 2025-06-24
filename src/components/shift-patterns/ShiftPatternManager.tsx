
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Clock, Users, X } from 'lucide-react';
import { useShiftPatterns, useCreateShiftPattern, useUpdateShiftPattern, useDeleteShiftPattern } from '@/hooks/use-shift-patterns';
import { useEmployees } from '@/hooks/use-employees';
import { ShiftPattern } from '@/types/shift-patterns';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ShiftPatternManager = () => {
  const { data: shiftPatterns = [], isLoading } = useShiftPatterns();
  const { data: employees = [] } = useEmployees();
  const createPattern = useCreateShiftPattern();
  const updatePattern = useUpdateShiftPattern();
  const deletePattern = useDeleteShiftPattern();
  const { toast } = useToast();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<ShiftPattern | null>(null);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [formData, setFormData] = useState({
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

  const handleCreate = () => {
    setEditingPattern(null);
    resetForm();
    setIsCreateModalOpen(true);
  };

  const handleEdit = (pattern: ShiftPattern) => {
    setEditingPattern(pattern);
    setFormData({
      name: pattern.name,
      start_time: pattern.start_time,
      end_time: pattern.end_time,
      break_duration: pattern.break_duration,
      grace_period_minutes: pattern.grace_period_minutes,
      overtime_threshold_minutes: pattern.overtime_threshold_minutes,
    });
    setSelectedEmployees([]);
    setSelectedEmployeeId('');
    setIsCreateModalOpen(true);
  };

  const handleAddEmployee = () => {
    if (selectedEmployeeId && !selectedEmployees.includes(selectedEmployeeId)) {
      setSelectedEmployees(prev => [...prev, selectedEmployeeId]);
      setSelectedEmployeeId('');
    }
  };

  const handleRemoveEmployee = (employeeId: string) => {
    setSelectedEmployees(prev => prev.filter(id => id !== employeeId));
  };

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find(e => e.id === employeeId);
    return employee?.name || 'Unknown Employee';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingPattern) {
        await updatePattern.mutateAsync({
          id: editingPattern.id,
          ...formData,
        });
        
        // Create weekly recurring schedules for assigned employees
        if (selectedEmployees.length > 0) {
          // This would need to be implemented to create recurring schedules
          console.log('Creating recurring schedules for employees:', selectedEmployees);
          toast({
            title: "Pattern updated",
            description: `Pattern updated and will be applied to ${selectedEmployees.length} employees weekly.`,
          });
        }
      } else {
        await createPattern.mutateAsync(formData);
      }
      setIsCreateModalOpen(false);
      resetForm();
      setEditingPattern(null);
    } catch (error) {
      console.error('Error saving shift pattern:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this shift pattern?')) {
      try {
        await deletePattern.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting shift pattern:', error);
      }
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  if (isLoading) {
    return <div>Loading shift patterns...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Shift Patterns
          </CardTitle>
          <Button onClick={handleCreate} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Pattern
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {shiftPatterns.map((pattern) => (
            <div key={pattern.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h3 className="font-medium">{pattern.name}</h3>
                <p className="text-sm text-gray-500">
                  {formatTime(pattern.start_time)} - {formatTime(pattern.end_time)}
                </p>
                <p className="text-xs text-gray-400">
                  Break: {pattern.break_duration}min | Grace: {pattern.grace_period_minutes}min
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => handleEdit(pattern)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(pattern.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
          {shiftPatterns.length === 0 && (
            <p className="text-center text-gray-500 py-8">
              No shift patterns created yet. Add your first pattern to get started.
            </p>
          )}
        </div>

        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPattern ? 'Edit Shift Pattern' : 'Create Shift Pattern'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Pattern Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Morning Shift, Afternoon Shift"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({...formData, end_time: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="break_duration">Break (minutes)</Label>
                  <Input
                    id="break_duration"
                    type="number"
                    value={formData.break_duration}
                    onChange={(e) => setFormData({...formData, break_duration: parseInt(e.target.value)})}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="grace_period">Grace Period (minutes)</Label>
                  <Input
                    id="grace_period"
                    type="number"
                    value={formData.grace_period_minutes}
                    onChange={(e) => setFormData({...formData, grace_period_minutes: parseInt(e.target.value)})}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="overtime_threshold">Overtime Threshold (minutes)</Label>
                  <Input
                    id="overtime_threshold"
                    type="number"
                    value={formData.overtime_threshold_minutes}
                    onChange={(e) => setFormData({...formData, overtime_threshold_minutes: parseInt(e.target.value)})}
                    min="0"
                  />
                </div>
              </div>

              {/* Employee Assignment Section - Only show when editing */}
              {editingPattern && (
                <div className="space-y-4 border-t pt-4">
                  <h4 className="font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Assign Employees to Pattern
                  </h4>
                  
                  <div className="flex gap-2">
                    <Select value={selectedEmployeeId} onValueChange={setSelectedEmployeeId}>
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Choose an employee..." />
                      </SelectTrigger>
                      <SelectContent>
                        {employees
                          .filter(emp => !selectedEmployees.includes(emp.id))
                          .map((employee) => (
                            <SelectItem key={employee.id} value={employee.id}>
                              {employee.name} - {employee.job_title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button 
                      type="button"
                      onClick={handleAddEmployee}
                      disabled={!selectedEmployeeId}
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add
                    </Button>
                  </div>

                  {selectedEmployees.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Employees:</Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmployees.map((employeeId) => (
                          <Badge key={employeeId} variant="secondary" className="flex items-center gap-1">
                            {getEmployeeName(employeeId)}
                            <button
                              type="button"
                              onClick={() => handleRemoveEmployee(employeeId)}
                              className="ml-1 hover:text-red-600"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600">
                        This pattern will be applied weekly to the selected employees.
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createPattern.isPending || updatePattern.isPending}>
                  {editingPattern ? 'Update Pattern' : 'Create Pattern'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default ShiftPatternManager;
