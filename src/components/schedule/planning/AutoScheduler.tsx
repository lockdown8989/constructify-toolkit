
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { useShiftPlanning } from '@/hooks/use-shift-planning';
import { Calendar, Settings, Zap, CheckCircle, AlertTriangle } from 'lucide-react';

const AutoScheduler: React.FC = () => {
  const { shiftTemplates, autoSchedule } = useShiftPlanning();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const handleTemplateToggle = (templateId: string) => {
    setSelectedTemplates(prev => 
      prev.includes(templateId)
        ? prev.filter(id => id !== templateId)
        : [...prev, templateId]
    );
  };

  const handleRunAutoSchedule = async () => {
    if (selectedTemplates.length === 0) return;

    setIsRunning(true);
    try {
      await autoSchedule.mutateAsync({
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        templateIds: selectedTemplates
      });
    } catch (error) {
      console.error('Auto-schedule error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const calculateShiftCount = () => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    let totalShifts = 0;
    selectedTemplates.forEach(templateId => {
      const template = shiftTemplates.find(t => t.id === templateId);
      if (template) {
        totalShifts += template.days_of_week.length * Math.ceil(days / 7);
      }
    });
    
    return totalShifts;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Auto Scheduler</h2>
        <Badge variant="outline" className="flex items-center gap-2">
          <Zap className="h-3 w-3" />
          Intelligent Scheduling
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule Period
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start-date">Start Date</Label>
                  <Input
                    id="start-date"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="end-date">End Date</Label>
                  <Input
                    id="end-date"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Select Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {shiftTemplates.length === 0 ? (
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">No shift templates available</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Create shift templates first to use auto-scheduling
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shiftTemplates.map((template) => (
                    <div key={template.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      <Checkbox
                        id={`template-${template.id}`}
                        checked={selectedTemplates.includes(template.id)}
                        onCheckedChange={() => handleTemplateToggle(template.id)}
                      />
                      <div className="flex-1">
                        <label 
                          htmlFor={`template-${template.id}`}
                          className="font-medium cursor-pointer"
                        >
                          {template.name}
                        </label>
                        <div className="text-sm text-gray-600">
                          {template.start_time} - {template.end_time}
                          {template.role && ` • ${template.role}`}
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.days_of_week.map((day) => (
                            <Badge key={day} variant="outline" className="text-xs">
                              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary and Actions */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Schedule Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-sm">Period:</span>
                <span className="text-sm font-medium">
                  {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Templates:</span>
                <span className="text-sm font-medium">{selectedTemplates.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Est. Shifts:</span>
                <span className="text-sm font-medium text-blue-600">{calculateShiftCount()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Auto-Schedule Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="avoid-conflicts" defaultChecked />
                  <Label htmlFor="avoid-conflicts" className="text-sm">
                    Avoid scheduling conflicts
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="respect-availability" defaultChecked />
                  <Label htmlFor="respect-availability" className="text-sm">
                    Respect employee availability
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="optimize-costs" defaultChecked />
                  <Label htmlFor="optimize-costs" className="text-sm">
                    Optimize labor costs
                  </Label>
                </div>
              </div>

              <Button 
                className="w-full" 
                onClick={handleRunAutoSchedule}
                disabled={selectedTemplates.length === 0 || isRunning}
              >
                {isRunning ? (
                  <>
                    <Settings className="h-4 w-4 mr-2 animate-spin" />
                    Generating Schedules...
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4 mr-2" />
                    Run Auto-Schedule
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Optimization Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium">Best Results</div>
                  <div className="text-gray-600">Use 1-2 week periods for optimal scheduling</div>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <div className="font-medium">Review Required</div>
                  <div className="text-gray-600">Always review generated schedules before publishing</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AutoScheduler;
