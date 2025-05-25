
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useShiftPlanning } from '@/hooks/use-shift-planning';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  AlertTriangle, 
  Users, 
  File,
  TrendingUp,
  Settings
} from 'lucide-react';
import ShiftTemplateManager from './ShiftTemplateManager';
import AvailabilityManager from './AvailabilityManager';
import ConflictResolver from './ConflictResolver';
import CostAnalytics from './CostAnalytics';
import AutoScheduler from './AutoScheduler';

const ShiftPlanningDashboard: React.FC = () => {
  const {
    shiftTemplates,
    scheduleConflicts,
    laborCosts,
    templatesLoading,
    conflictsLoading,
    costsLoading
  } = useShiftPlanning();

  const [activeTab, setActiveTab] = useState('overview');

  // Calculate summary statistics
  const totalConflicts = scheduleConflicts.length;
  const criticalConflicts = scheduleConflicts.filter(c => c.severity === 'critical').length;
  const totalCosts = laborCosts.reduce((sum, cost) => sum + cost.total_cost, 0);
  const overtimeCosts = laborCosts.reduce((sum, cost) => sum + cost.overtime_cost, 0);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Shift Planning Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          <TabsTrigger value="costs">Cost Analysis</TabsTrigger>
          <TabsTrigger value="auto-schedule">Auto Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Templates</CardTitle>
                <File className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{shiftTemplates.length}</div>
                <p className="text-xs text-muted-foreground">
                  Reusable shift patterns
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Conflicts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{totalConflicts}</div>
                <p className="text-xs text-muted-foreground">
                  {criticalConflicts} critical issues
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Labor Costs</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalCosts.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  ${overtimeCosts.toFixed(2)} overtime
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Efficiency</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94%</div>
                <p className="text-xs text-muted-foreground">
                  Schedule optimization
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Conflicts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Recent Conflicts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {conflictsLoading ? (
                <div className="text-center py-4">Loading conflicts...</div>
              ) : scheduleConflicts.length === 0 ? (
                <div className="text-center py-4 text-green-600">
                  ✅ No conflicts detected!
                </div>
              ) : (
                <div className="space-y-3">
                  {scheduleConflicts.slice(0, 5).map((conflict) => (
                    <div key={conflict.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge className={`${getSeverityColor(conflict.severity)} text-white`}>
                          {conflict.severity}
                        </Badge>
                        <div>
                          <div className="font-medium capitalize">{conflict.conflict_type} Conflict</div>
                          <div className="text-sm text-gray-500">
                            {new Date(conflict.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" variant="outline">
                        Resolve
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <ShiftTemplateManager />
        </TabsContent>

        <TabsContent value="availability">
          <AvailabilityManager />
        </TabsContent>

        <TabsContent value="conflicts">
          <ConflictResolver />
        </TabsContent>

        <TabsContent value="costs">
          <CostAnalytics />
        </TabsContent>

        <TabsContent value="auto-schedule">
          <AutoScheduler />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftPlanningDashboard;
