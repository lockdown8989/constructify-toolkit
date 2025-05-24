
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useShiftPlanning } from '@/hooks/use-shift-planning';
import { Plus, Edit, Trash2, Clock, MapPin } from 'lucide-react';

const ShiftTemplateManager: React.FC = () => {
  const { shiftTemplates, createShiftTemplate, templatesLoading } = useShiftPlanning();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    role: '',
    start_time: '',
    end_time: '',
    break_duration: 30,
    days_of_week: [] as number[],
    location: '',
    requirements: {}
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createShiftTemplate.mutateAsync(formData);
      setIsDialogOpen(false);
      setFormData({
        name: '',
        role: '',
        start_time: '',
        end_time: '',
        break_duration: 30,
        days_of_week: [],
        location: '',
        requirements: {}
      });
    } catch (error) {
      console.error('Error creating template:', error);
    }
  };

  const handleDayToggle = (dayIndex: number) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayIndex)
        ? prev.days_of_week.filter(d => d !== dayIndex)
        : [...prev.days_of_week, dayIndex]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Shift Templates</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Shift Template</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Template Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Morning Shift"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                    placeholder="Cashier, Server, etc."
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="start_time">Start Time</Label>
                  <Input
                    id="start_time"
                    type="time"
                    value={formData.start_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, start_time: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">End Time</Label>
                  <Input
                    id="end_time"
                    type="time"
                    value={formData.end_time}
                    onChange={(e) => setFormData(prev => ({ ...prev, end_time: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="break_duration">Break (minutes)</Label>
                  <Input
                    id="break_duration"
                    type="number"
                    value={formData.break_duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, break_duration: parseInt(e.target.value) }))}
                    min="0"
                    max="120"
                  />
                </div>
              </div>

              <div>
                <Label>Days of Week</Label>
                <div className="grid grid-cols-4 gap-2 mt-2">
                  {dayNames.map((day, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Checkbox
                        id={`day-${index}`}
                        checked={formData.days_of_week.includes(index)}
                        onCheckedChange={() => handleDayToggle(index)}
                      />
                      <Label htmlFor={`day-${index}`} className="text-sm">
                        {day.slice(0, 3)}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Main Floor, Kitchen, etc."
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createShiftTemplate.isPending}>
                  {createShiftTemplate.isPending ? 'Creating...' : 'Create Template'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {templatesLoading ? (
        <div className="text-center py-8">Loading templates...</div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {shiftTemplates.map((template) => (
            <Card key={template.id} className="relative">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  {template.name}
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {template.role && (
                  <Badge variant="secondary">{template.role}</Badge>
                )}
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4" />
                  {template.start_time} - {template.end_time}
                  {template.break_duration > 0 && (
                    <span className="text-gray-500">({template.break_duration}min break)</span>
                  )}
                </div>

                {template.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4" />
                    {template.location}
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {template.days_of_week.map((day) => (
                    <Badge key={day} variant="outline" className="text-xs">
                      {dayNames[day].slice(0, 3)}
                    </Badge>
                  ))}
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
