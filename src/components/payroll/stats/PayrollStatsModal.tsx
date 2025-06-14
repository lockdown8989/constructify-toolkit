
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/format';
import { useEmployees } from '@/hooks/use-employees';
import { usePayrollProcessingHistory } from '@/hooks/use-payroll-history';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface PayrollStatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  statType: 'total' | 'employees' | 'paid' | 'pending' | 'absent';
  statValue: number | string;
}

export const PayrollStatsModal: React.FC<PayrollStatsModalProps> = ({
  isOpen,
  onClose,
  statType,
  statValue,
}) => {
  const { data: employees = [] } = useEmployees();
  const { data: payrollHistory = [] } = usePayrollProcessingHistory();

  const getModalContent = () => {
    switch (statType) {
      case 'total':
        return {
          title: 'Total Payroll Breakdown',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Current Month</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(Number(statValue))}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Average Per Employee</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {formatCurrency(employees.length > 0 ? Number(statValue) / employees.length : 0)}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="space-y-2">
                <h4 className="font-medium">Recent Processing History</h4>
                {payrollHistory.slice(0, 5).map((history) => (
                  <div key={history.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">
                        {history.employee_count} employees processed
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(history.processing_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-green-600">
                        {history.success_count} Success
                      </Badge>
                      {history.fail_count > 0 && (
                        <Badge variant="destructive">
                          {history.fail_count} Failed
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ),
        };

      case 'employees':
        return {
          title: 'Employee Overview',
          content: (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Total</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{employees.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Active</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">
                      {employees.filter(emp => emp.status === 'Active').length}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">On Leave</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-amber-600">
                      {employees.filter(emp => emp.status === 'Leave').length}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Employee List</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.job_title}</div>
                      </div>
                      <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
        };

      case 'paid':
        const paidEmployees = employees.filter(emp => emp.status === 'Active');
        return {
          title: 'Paid Employees',
          content: (
            <div className="space-y-4">
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{statValue}</div>
                <div className="text-sm text-green-700">Employees paid this month</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Recently Paid</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {paidEmployees.slice(0, 10).map((employee) => (
                    <div key={employee.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.department}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(employee.salary)}</div>
                        <Badge className="bg-green-100 text-green-800">Paid</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
        };

      case 'pending':
        const pendingEmployees = employees.filter(emp => emp.status !== 'Active');
        return {
          title: 'Pending Payroll',
          content: (
            <div className="space-y-4">
              <div className="text-center p-4 bg-amber-50 rounded-lg">
                <div className="text-3xl font-bold text-amber-600">{statValue}</div>
                <div className="text-sm text-amber-700">Employees pending payment</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Pending Payments</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {pendingEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.department}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(employee.salary)}</div>
                        <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
        };

      case 'absent':
        const absentEmployees = employees.filter(emp => emp.status === 'Leave');
        return {
          title: 'Absent Employees',
          content: (
            <div className="space-y-4">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="text-3xl font-bold text-gray-600">{statValue}</div>
                <div className="text-sm text-gray-700">Employees currently absent</div>
              </div>

              <div className="space-y-2">
                <h4 className="font-medium">Currently Absent</h4>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {absentEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center gap-3 p-3 border rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback>
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="font-medium">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.department}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">On Leave</div>
                        <Badge variant="secondary">Absent</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ),
        };

      default:
        return { title: 'Details', content: <div>No data available</div> };
    }
  };

  const { title, content } = getModalContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
