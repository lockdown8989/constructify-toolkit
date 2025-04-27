
import React from 'react';
import { format, subMonths } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, Calendar, ArrowUpRight, Clock, CheckCircle, XCircle } from 'lucide-react';

interface PayrollStatsGridProps {
  totalPayroll: number;
  totalEmployees: number;
  paidEmployees: number;
  pendingEmployees: number;
  absentEmployees: number;
}

export const PayrollStatsGrid: React.FC<PayrollStatsGridProps> = ({
  totalPayroll,
  totalEmployees,
  paidEmployees,
  pendingEmployees,
  absentEmployees,
}) => {
  const currentMonth = format(new Date(), 'MMMM yyyy');
  const previousMonth = format(subMonths(new Date(), 1), 'MMMM yyyy');

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Total Payslips</CardDescription>
          <CardTitle className="text-2xl flex items-center">
            <DollarSign className="h-5 w-5 mr-1 text-gray-500" />
            ${totalPayroll.toLocaleString()}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500">
            For {totalEmployees} employees
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Current Period</CardDescription>
          <CardTitle className="text-2xl flex items-center">
            <Calendar className="h-5 w-5 mr-1 text-gray-500" />
            {currentMonth}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-500 flex items-center">
            <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
            5% increase from {previousMonth}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardDescription>Payment Status</CardDescription>
          <CardTitle className="text-2xl flex items-center gap-2">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-1 text-green-500" />
              {paidEmployees}
            </div>
            <div className="text-sm text-gray-500">paid</div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-yellow-500" />
              <span className="text-sm">{pendingEmployees} pending</span>
            </div>
            <div className="flex items-center">
              <XCircle className="h-4 w-4 mr-1 text-gray-500" />
              <span className="text-sm">{absentEmployees} absent</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
