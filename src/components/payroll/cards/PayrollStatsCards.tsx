
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, FileText, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/format';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PayrollStatsCardsProps {
  totalEmployees: number;
  pendingEmployees: number;
  overtimeHours: number;
  onCardClick: (statType: 'total' | 'employees' | 'paid' | 'pending' | 'absent', value: number) => void;
}

export const PayrollStatsCards: React.FC<PayrollStatsCardsProps> = ({
  totalEmployees,
  pendingEmployees,
  overtimeHours,
  onCardClick
}) => {
  // Fetch live monthly payroll data
  const { data: monthlyPayrollData } = useQuery({
    queryKey: ['monthly-payroll'],
    queryFn: async () => {
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
      
      const { data, error } = await supabase
        .from('payroll')
        .select('salary_paid, payment_status')
        .gte('payment_date', `${currentMonth}-01`)
        .lt('payment_date', `${currentMonth}-32`);
      
      if (error) {
        console.error('Error fetching monthly payroll:', error);
        return { totalPayroll: 0, pendingPayslips: 0 };
      }
      
      const totalPayroll = data?.reduce((sum, record) => sum + (record.salary_paid || 0), 0) || 0;
      const pendingPayslips = data?.filter(record => 
        record.payment_status === 'pending' || record.payment_status === 'processing'
      ).length || 0;
      
      return { totalPayroll, pendingPayslips };
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch live overtime data for current week
  const { data: weeklyOvertimeData } = useQuery({
    queryKey: ['weekly-overtime'],
    queryFn: async () => {
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const startDate = oneWeekAgo.toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('attendance')
        .select('overtime_minutes')
        .gte('date', startDate);
      
      if (error) {
        console.error('Error fetching overtime data:', error);
        return 0;
      }
      
      const totalOvertimeMinutes = data?.reduce((sum, record) => sum + (record.overtime_minutes || 0), 0) || 0;
      return Math.round(totalOvertimeMinutes / 60); // Convert to hours
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const totalPayroll = monthlyPayrollData?.totalPayroll || 0;
  const pendingPayslips = monthlyPayrollData?.pendingPayslips || pendingEmployees;
  const actualOvertimeHours = weeklyOvertimeData || overtimeHours;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Monthly Payroll Card */}
      <Card 
        className="border shadow-sm bg-green-50 text-green-600 border-opacity-50 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
        onClick={() => onCardClick('total', totalPayroll)}
      >
        <CardContent className="p-4 flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
            <DollarSign className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium mb-1">Monthly Payroll</p>
          <p className="text-xl font-bold">{formatCurrency(totalPayroll)}</p>
          <p className="text-xs text-green-500 mt-1">This month</p>
        </CardContent>
      </Card>

      {/* Total Employees Card */}
      <Card 
        className="border shadow-sm bg-blue-50 text-blue-600 border-opacity-50 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
        onClick={() => onCardClick('employees', totalEmployees)}
      >
        <CardContent className="p-4 flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center mb-3">
            <Users className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium mb-1">Total Employees</p>
          <p className="text-xl font-bold">{formatNumber(totalEmployees)}</p>
          <p className="text-xs text-blue-500 mt-1">Active employees</p>
        </CardContent>
      </Card>

      {/* Pending Payslips Card */}
      <Card 
        className="border shadow-sm bg-amber-50 text-amber-600 border-opacity-50 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
        onClick={() => onCardClick('pending', pendingPayslips)}
      >
        <CardContent className="p-4 flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium mb-1">Pending Payslips</p>
          <p className="text-xl font-bold">{formatNumber(pendingPayslips)}</p>
          <p className="text-xs text-amber-500 mt-1">To be processed</p>
        </CardContent>
      </Card>

      {/* Overtime Hours Card */}
      <Card 
        className="border shadow-sm bg-purple-50 text-purple-600 border-opacity-50 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
        onClick={() => onCardClick('total', actualOvertimeHours)}
      >
        <CardContent className="p-4 flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium mb-1">Overtime Hours</p>
          <p className="text-xl font-bold">{actualOvertimeHours}</p>
          <p className="text-xs text-purple-500 mt-1">This week</p>
        </CardContent>
      </Card>
    </div>
  );
};
