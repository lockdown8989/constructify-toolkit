
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useShiftPlanning } from '@/hooks/use-shift-planning';
import { Bot, Calendar, Clock, Users, Settings } from 'lucide-react';
import { format } from 'date-fns';

const AutoScheduler: React.FC = () => {
  const { shiftTemplates, autoSchedule } = useShiftPlanning();
  const [schedulingParams, setSchedulingParams] = useState({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    selectedTemplates: [] as string[],
    optimizationGoals: {
      minimizeCosts: true,
      maximizeCoverage: true,
      respectAvailability: true,
      balanceWorkload: true
    }
  });

  const handleTemplateToggle = (templateId: string) => {
    setSchedulingParams(prev => ({
      ...prev,
      selectedTemplates: prev.selectedTemplates.includes(templateId)
        ? prev.selectedTemplates.filter(id => id !== templateId)
        : [...prev.selectedTemplates, templateId]
    }));
  };

  const handleGoalToggle = (goal: keyof typeof schedulingParams.optimizationGoals) => {
    setSchedulingParams(prev => ({
      ...prev,
      optimizationGoals: {
        ...prev.optimizationGoals,
        [goal]: !prev.optimizationGoals[goal]
      }
    }));
  };

  const handleAutoSchedule = async () => {
    try {
      await autoSchedule.mutateAsync({
        startDate: new Date(schedulingParams.startDate),
        endDate: new Date(schedulingParams.endDate),
        templateIds: schedulingParams.selectedTemplates
      });
    } catch (error) {
      console.error('Auto-scheduling failed:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bot className="h-8 w-8 text-blue-600" />
        <div>
          <h2 className="text-2xl font-bold">Intelligent Auto-Scheduler</h2>
          <p className="text-gray-600">Let AI optimize your shift planning automatically</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuration Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Scheduling Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={schedulingParams.startDate}
                    onChange={(e) => setSchedulingParams(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={schedulingParams.endDate}
                    onChange={(e) => setSchedulingParams(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Shift Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {shiftTemplates.map((template) => (
                  <div key={template.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      id={`template-${template.id}`}
                      checked={schedulingParams.selectedTemplates.includes(template.id)}
                      onCheckedChange={() => handleTemplateToggle(template.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={`template-${template.id}`} className="font-medium">
                        {template.name}
                      </Label>
                      <div className="text-sm text-gray-600">
                        {template.start_time} - {template.end_time}
                        {template.role && ` • ${template.role}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Optimization Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(schedulingParams.optimizationGoals).map(([goal, enabled]) => (
                  <div key={goal} className="flex items-center space-x-3">
                    <Checkbox
                      id={goal}
                      checked={enabled}
                      onCheckedChange={() => handleGoalToggle(goal as keyof typeof schedulingParams.optimizationGoals)}
                    />
                    <Label htmlFor={goal} className="flex-1">
                      {goal === 'minimizeCosts' && 'Minimize Labor Costs'}
                      {goal === 'maximizeCoverage' && 'Maximize Shift Coverage'}
                      {goal === 'respectAvailability' && 'Respect Employee Availability'}
                      {goal === 'balanceWorkload' && 'Balance Workload Distribution'}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                AI Scheduler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {schedulingParams.selectedTemplates.length}
                </div>
                <div className="text-sm text-gray-600">Templates Selected</div>
              </div>

              <Button 
                onClick={handleAutoSchedule}
                disabled={schedulingParams.selectedTemplates.length === 0 || autoSchedule.isPending}
                className="w-full"
                size="lg"
              >
                {autoSchedule.isPending ? 'Generating Schedule...' : 'Generate Smart Schedule'}
              </Button>

              <div className="text-xs text-gray-500 text-center">
                AI will analyze employee availability, skill requirements, and cost optimization to create the best possible schedule.
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Period Duration:</span>
                <span className="font-medium">
                  {Math.ceil((new Date(schedulingParams.endDate).getTime() - new Date(schedulingParams.startDate).getTime()) / (1000 * 60 * 60 * 24))} days
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Templates:</span>
                <span className="font-medium">{schedulingParams.selectedTemplates.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Est. Shifts:</span>
                <span className="font-medium">~{schedulingParams.selectedTemplates.length * 7}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AutoScheduler;
