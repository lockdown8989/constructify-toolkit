import React from 'react';
import RestaurantScheduleContent from './RestaurantScheduleContent';

const SingleShiftSchedule = () => {
  return (
    <div className="space-y-6">
      {/* Info card explaining single shifts vs rota */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-medium text-blue-900 mb-2">Single Shift Management</h3>
        <p className="text-blue-700 text-sm">
          This page is for managing individual shifts, open shifts, and ad-hoc scheduling. 
          For recurring employee rota patterns, please use the <strong>Rota Employee</strong> section.
        </p>
      </div>
      
      <RestaurantScheduleContent />
    </div>
  );
};

export default SingleShiftSchedule;