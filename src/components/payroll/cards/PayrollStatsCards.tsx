
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { DollarSign, Users, FileText, TrendingUp } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/utils/format';

interface PayrollStatsCardsProps {
  totalPayroll: number;
  totalEmployees: number;
  pendingEmployees: number;
  overtimeHours: number;
  onCardClick: (statType: 'total' | 'employees' | 'paid' | 'pending' | 'absent', value: number) => void;
}

export const PayrollStatsCards: React.FC<PayrollStatsCardsProps> = ({
  totalPayroll,
  totalEmployees,
  pendingEmployees,
  overtimeHours,
  onCardClick
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {/* Total Payroll Card */}
      <Card 
        className="border shadow-sm bg-green-50 text-green-600 border-opacity-50 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
        onClick={() => onCardClick('total', totalPayroll)}
      >
        <CardContent className="p-4 flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center mb-3">
            <DollarSign className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium mb-1">Total Payroll</p>
          <p className="text-xl font-bold">{formatCurrency(totalPayroll)}</p>
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
        </CardContent>
      </Card>

      {/* Pending Payslips Card */}
      <Card 
        className="border shadow-sm bg-amber-50 text-amber-600 border-opacity-50 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
        onClick={() => onCardClick('pending', pendingEmployees)}
      >
        <CardContent className="p-4 flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center mb-3">
            <FileText className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium mb-1">Pending Payslips</p>
          <p className="text-xl font-bold">{formatNumber(pendingEmployees)}</p>
        </CardContent>
      </Card>

      {/* Overtime Hours Card */}
      <Card 
        className="border shadow-sm bg-purple-50 text-purple-600 border-opacity-50 cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
        onClick={() => onCardClick('total', overtimeHours)}
      >
        <CardContent className="p-4 flex flex-col">
          <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center mb-3">
            <TrendingUp className="h-5 w-5" />
          </div>
          <p className="text-sm font-medium mb-1">Overtime Hours</p>
          <p className="text-xl font-bold">{overtimeHours}</p>
        </CardContent>
      </Card>
    </div>
  );
};
