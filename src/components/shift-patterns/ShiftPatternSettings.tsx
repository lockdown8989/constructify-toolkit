
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Users } from 'lucide-react';
import ShiftPatternManager from './ShiftPatternManager';
import EmployeeShiftAssignmentComponent from './EmployeeShiftAssignment';

const ShiftPatternSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Shift Pattern Management</h2>
        <p className="text-muted-foreground">
          Manage shift patterns and assign them to employees for better scheduling and attendance tracking.
        </p>
      </div>

      <Tabs defaultValue="patterns" className="space-y-4">
        <TabsList>
          <TabsTrigger value="patterns" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Shift Patterns
          </TabsTrigger>
          <TabsTrigger value="assignments" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Employee Assignments
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="patterns">
          <ShiftPatternManager />
        </TabsContent>
        
        <TabsContent value="assignments">
          <EmployeeShiftAssignmentComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftPatternSettings;
