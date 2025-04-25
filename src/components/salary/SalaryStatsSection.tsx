
import React from 'react';
import SalaryStatCard from './SalaryStatCard';
import { useSalaryStatistics } from '@/hooks/use-salary-statistics';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { formatCurrency } from '@/utils/format';

export const SalaryStatsSection = () => {
  const { employeeId } = useEmployeeDataManagement();
  const { data: stats } = useSalaryStatistics(employeeId);

  const formatHours = (hours: number) => {
    return `${hours.toFixed(2)} hrs`;
  };

  const totalAmount = (stats?.regular_amount || 0) + (stats?.overtime_amount || 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <SalaryStatCard
        title="Work hours"
        value={formatHours(stats?.regular_hours || 0)}
        secondaryValue={formatCurrency(stats?.regular_amount || 0)}
        bgColor="bg-amber-100"
      />
      <SalaryStatCard
        title="Overtime Hours"
        value={formatHours(stats?.overtime_hours || 0)}
        secondaryValue={formatCurrency(stats?.overtime_amount || 0)}
        bgColor="bg-gray-200"
      />
      <SalaryStatCard
        title="Attendance% performance"
        value={`${stats?.attendance_rate || 0}%`}
        bgColor="bg-gray-600"
        valueClassName="text-white"
        titleClassName="text-gray-200"
      />
    </div>
  );
};

export default SalaryStatsSection;
