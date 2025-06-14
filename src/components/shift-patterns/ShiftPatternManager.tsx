
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Clock, Users } from 'lucide-react';
import { useShiftPatterns, useCreateShiftPattern, useUpdateShiftPattern, useDeleteShiftPattern } from '@/hooks/use-shift-patterns';
import { ShiftPattern } from '@/types/shift-patterns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

const ShiftPatternManager = () => {
  const { data: shiftPatterns = [], isLoading } = useShiftPatterns();
  const createMutation = useCreateShiftPattern();
  const updateMutation = useUpdateShiftPattern();
  const deleteMutation = useDeleteShiftPattern();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPattern, setEditingPattern] = useState<ShiftPattern | null>(null);
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
    setEditingPattern(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPattern) {
      updateMutation.mutate({
        id: editingPattern.id,
        ...formData,
      });
    } else {
      createMutation.mutate(formData);
    }
    
    setIsDialogOpen(false);
    resetForm();
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
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this shift pattern?')) {
      deleteMutation.mutate(id);
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Shift Patterns</h2>
          <p className="text-gray-600">Manage shift schedules and attendance tracking</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Add Shift Pattern
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingPattern ? 'Edit Shift Pattern' : 'Create New Shift Pattern'}
              </DialogTitle>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Pattern Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Morning Shift"
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
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="break_duration">Break Duration (min)</Label>
                  <Input
                    id="break_duration"
                    type="number"
                    value={formData.break_duration}
                    onChange={(e) => setFormData({ ...formData, break_duration: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="grace_period">Grace Period (min)</Label>
                  <Input
                    id="grace_period"
                    type="number"
                    value={formData.grace_period_minutes}
                    onChange={(e) => setFormData({ ...formData, grace_period_minutes: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
                <div>
                  <Label htmlFor="overtime_threshold">Overtime Threshold (min)</Label>
                  <Input
                    id="overtime_threshold"
                    type="number"
                    value={formData.overtime_threshold_minutes}
                    onChange={(e) => setFormData({ ...formData, overtime_threshold_minutes: parseInt(e.target.value) })}
                    min="0"
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPattern ? 'Update' : 'Create'} Pattern
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {shiftPatterns.map((pattern) => (
          <Card key={pattern.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">{pattern.name}</h3>
                    <Badge variant="outline" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(pattern.start_time)} - {formatTime(pattern.end_time)}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>Break: {pattern.break_duration}min</span>
                    <span>Grace: {pattern.grace_period_minutes}min</span>
                    <span>OT Threshold: {pattern.overtime_threshold_minutes}min</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(pattern)}
                  >
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ShiftPatternManager;
