
import React from 'react';
import SalaryStatCard from './SalaryStatCard';

export const SalaryStatsSection = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <SalaryStatCard
        title="Work hours"
        value="264.00 hrs"
        secondaryValue="$2,647"
        bgColor="bg-amber-100"
      />
      <SalaryStatCard
        title="Overtime Hours"
        value="74 hrs"
        bgColor="bg-gray-200"
      />
      <SalaryStatCard
        title="Attendance% performance"
        value="63%"
        bgColor="bg-gray-600"
        valueClassName="text-white"
        titleClassName="text-gray-200"
      />
    </div>
  );
};

export default SalaryStatsSection;
