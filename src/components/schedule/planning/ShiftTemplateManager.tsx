
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useShiftPlanning } from '@/hooks/use-shift-planning';
import { Plus, Edit, Trash2, Clock, Users } from 'lucide-react';

const ShiftTemplateManager: React.FC = () => {
  const { shiftTemplates, createShiftTemplate, templatesLoading } = useShiftPlanning();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    role: '',
    start_time: '',
    end_time: '',
    days_of_week: [] as number[],
    location: '',
    break_duration: 30
  });

  const dayLabels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleCreateTemplate = async () => {
    if (!newTemplate.name || !newTemplate.start_time || !newTemplate.end_time) return;

    try {
      await createShiftTemplate.mutateAsync({
        name: newTemplate.name,
        role: newTemplate.role || undefined,
        start_time: newTemplate.start_time,
        end_time: newTemplate.end_time,
        days_of_week: newTemplate.days_of_week,
        location: newTemplate.location || undefined,
        break_duration: newTemplate.break_duration,
        requirements: {}
      });

      setNewTemplate({
        name: '',
        role: '',
        start_time: '',
        end_time: '',
        days_of_week: [],
        location: '',
        break_duration: 30
      });
      setIsCreateOpen(false);
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const toggleDay = (dayIndex: number) => {
    setNewTemplate(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayIndex)
        ? prev.days_of_week.filter(d => d !== dayIndex)
        : [...prev.days_of_week, dayIndex].sort()
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shift Templates</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Shift Template</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Morning Shift"
                  />
                </div>
                <div>
                  <Label htmlFor="template-role">Role</Label>
                  <Input
                    id="template-role"
                    value={newTemplate.role}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="e.g., Server, Manager"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Input
                    id="start-time"
                    type="time"
                    value={newTemplate.start_time}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, start_time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Input
                    id="end-time"
                    type="time"
                    value={newTemplate.end_time}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, end_time: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Days of Week</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {dayLabels.map((day, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant={newTemplate.days_of_week.includes(index) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleDay(index)}
                    >
                      {day.slice(0, 3)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={newTemplate.location}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="e.g., Main Floor"
                  />
                </div>
                <div>
                  <Label htmlFor="break-duration">Break Duration (minutes)</Label>
                  <Input
                    id="break-duration"
                    type="number"
                    value={newTemplate.break_duration}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, break_duration: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTemplate} disabled={createShiftTemplate.isPending}>
                  Create Template
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {templatesLoading ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shiftTemplates.map((template) => (
            <Card key={template.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex gap-1">
                    <Button size="sm" variant="outline">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-red-600">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {template.role && (
                  <Badge variant="secondary">{template.role}</Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  {template.start_time} - {template.end_time}
                </div>
                
                <div className="flex flex-wrap gap-1">
                  {template.days_of_week.map((day) => (
                    <Badge key={day} variant="outline" className="text-xs">
                      {dayLabels[day].slice(0, 3)}
                    </Badge>
                  ))}
                </div>

                {template.location && (
                  <div className="text-sm text-gray-600">
                    📍 {template.location}
                  </div>
                )}

                <div className="text-sm text-gray-600">
                  Break: {template.break_duration} minutes
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ShiftTemplateManager;
