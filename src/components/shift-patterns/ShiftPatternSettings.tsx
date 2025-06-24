
import React from 'react';
import ShiftPatternManager from './ShiftPatternManager';

const ShiftPatternSettings = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Shift Pattern Management</h1>
        <p className="text-gray-600 mt-2">
          Create and manage shift patterns that can be assigned to employees and repeated weekly.
        </p>
      </div>
      
      <ShiftPatternManager />
    </div>
  );
};

export default ShiftPatternSettings;
