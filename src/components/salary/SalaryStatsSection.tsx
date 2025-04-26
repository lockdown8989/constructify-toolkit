
import React from 'react';
import SalaryStatCard from './SalaryStatCard';
import { useSalaryStatistics } from '@/hooks/use-salary-statistics';
import { useEmployeeDataManagement } from '@/hooks/use-employee-data-management';
import { formatCurrency } from '@/utils/format';

export const SalaryStatsSection = () => {
  const { employeeId } = useEmployeeDataManagement();
  const { data: stats } = useSalaryStatistics(employeeId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <SalaryStatCard
        title="Base Salary"
        value={formatCurrency(stats?.base_salary || 0)}
        secondaryValue="Monthly"
        bgColor="bg-amber-100"
      />
      <SalaryStatCard
        title="Bonus"
        value={formatCurrency(stats?.bonus || 0)}
        secondaryValue={stats?.payment_status || 'Pending'}
        bgColor="bg-gray-200"
      />
      <SalaryStatCard
        title="Net Salary"
        value={formatCurrency(stats?.net_salary || 0)}
        secondaryValue={stats?.payment_date ? `Paid on ${new Date(stats.payment_date).toLocaleDateString()}` : 'Not paid yet'}
        bgColor="bg-gray-600"
        valueClassName="text-white"
        titleClassName="text-gray-200"
      />
    </div>
  );
};

export default SalaryStatsSection;
