
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShiftPatternManager from './ShiftPatternManager';
import EmployeeShiftAssignmentComponent from './EmployeeShiftAssignment';

const ShiftPatternsPage = () => {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shift Pattern Management</h1>
        <p className="text-gray-600 mt-2">
          Configure shift patterns and assign them to employees for accurate attendance tracking
        </p>
      </div>

      <Tabs defaultValue="patterns" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="patterns">Shift Patterns</TabsTrigger>
          <TabsTrigger value="assignments">Employee Assignments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="patterns" className="mt-6">
          <ShiftPatternManager />
        </TabsContent>
        
        <TabsContent value="assignments" className="mt-6">
          <EmployeeShiftAssignmentComponent />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShiftPatternsPage;
