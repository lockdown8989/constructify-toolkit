
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useShiftPlanning } from '@/hooks/use-shift-planning';
import { useEmployees } from '@/hooks/use-employees';
import { Plus, Clock, Calendar, User } from 'lucide-react';

const AvailabilityManager: React.FC = () => {
  const { availabilityPatterns, createAvailabilityPattern, availabilityLoading } = useShiftPlanning();
  const { data: employees = [] } = useEmployees();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    employee_id: '',
    day_of_week: 0,
    start_time: '',
    end_time: '',
    is_available: true,
    max_hours: 8,
    preferences: {},
    effective_from: new Date().toISOString().split('T')[0],
    effective_until: ''
  });

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAvailabilityPattern.mutateAsync({
        ...formData,
        effective_until: formData.effective_until || undefined
      });
      setIsDialogOpen(false);
      setFormData({
        employee_id: '',
        day_of_week: 0,
        start_time: '',
        end_time: '',
        is_available: true,
        max_hours: 8,
        preferences: {},
        effective_from: new Date().toISOString().split('T')[0],
        effective_until: ''
      });
    } catch (error) {
      console.error('Error creating availability pattern:', error);
    }
  };

  // Group availability patterns by employee
  const groupedPatterns = availabilityPatterns.reduce((acc, pattern) => {
    if (!acc[pattern.employee_id]) {
      acc[pattern.employee_id] = [];
    }
    acc[pattern.employee_id].push(pattern);
    return acc;
  }, {} as Record<string, typeof availabilityPatterns>);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Employee Availability</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Availability Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Set Employee Availability</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="employee_id">Employee</Label>
                <Select
                  value={formData.employee_id}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, employee_id: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees.map((employee) => (
                      <SelectItem key={employee.id} value={employee.id}>
                        {employee.name} - {employee.job_title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="day_of_week">Day of Week</Label>
                <Select
                  value={formData.day_of_week.toString()}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, day_of_week: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dayNames.map((day, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {day}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_available"
                  checked={formData.is_available}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
                />
                <Label htmlFor="is_available">Available on this day</Label>
              </div>

              {formData.is_available && (
                <>
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>

                  <div>
                    <Label htmlFor="max_hours">Maximum Hours</Label>
                    <Input
                      id="max_hours"
                      type="number"
                      value={formData.max_hours}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_hours: parseInt(e.target.value) }))}
                      min="1"
                      max="24"
                    />
                  </div>
                </>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="effective_from">Effective From</Label>
                  <Input
                    id="effective_from"
                    type="date"
                    value={formData.effective_from}
                    onChange={(e) => setFormData(prev => ({ ...prev, effective_from: e.target.value }))}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="effective_until">Effective Until (Optional)</Label>
                  <Input
                    id="effective_until"
                    type="date"
                    value={formData.effective_until}
                    onChange={(e) => setFormData(prev => ({ ...prev, effective_until: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createAvailabilityPattern.isPending}>
                  {createAvailabilityPattern.isPending ? 'Saving...' : 'Save Availability'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {availabilityLoading ? (
        <div className="text-center py-8">Loading availability patterns...</div>
      ) : (
        <div className="space-y-4">
          {employees.map((employee) => {
            const patterns = groupedPatterns[employee.id] || [];
            return (
              <Card key={employee.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <User className="h-5 w-5" />
                    {employee.name}
                    <Badge variant="secondary">{employee.job_title}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {patterns.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">
                      No availability patterns set
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {patterns.map((pattern) => (
                        <div key={pattern.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{dayNames[pattern.day_of_week]}</span>
                            <Badge variant={pattern.is_available ? "default" : "destructive"}>
                              {pattern.is_available ? "Available" : "Unavailable"}
                            </Badge>
                          </div>
                          {pattern.is_available && (
                            <div className="space-y-1 text-sm">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {pattern.start_time} - {pattern.end_time}
                              </div>
                              {pattern.max_hours && (
                                <div className="text-gray-600">
                                  Max: {pattern.max_hours} hours
                                </div>
                              )}
                            </div>
                          )}
                          <div className="text-xs text-gray-500 mt-2">
                            <Calendar className="h-3 w-3 inline mr-1" />
                            From {pattern.effective_from}
                            {pattern.effective_until && ` to ${pattern.effective_until}`}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AvailabilityManager;
