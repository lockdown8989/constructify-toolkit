
import React from 'react';
import ShiftPatternManager from './ShiftPatternManager';
import EmployeeShiftAssignmentComponent from './EmployeeShiftAssignment';
import AIPatternGenerator from './components/AIPatternGenerator';

const ShiftPatternSettings = () => {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Shift Pattern Management</h1>
        <p className="text-gray-600">Manage shift patterns and employee assignments with AI assistance</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <AIPatternGenerator />
          <ShiftPatternManager />
        </div>
        
        <div>
          <EmployeeShiftAssignmentComponent />
        </div>
      </div>
    </div>
  );
};

export default ShiftPatternSettings;
