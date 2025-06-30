
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatCurrency, formatNumber } from '@/utils/format';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Users, DollarSign, FileText, Clock } from 'lucide-react';

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
  statValue
}) => {
  // Fetch live employee data
  const { data: employees, isLoading: employeesLoading } = useQuery({
    queryKey: ['employees-live-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('id, name, job_title, salary, status')
        .eq('status', 'Active');
      
      if (error) throw error;
      return data;
    },
    enabled: isOpen
  });

  // Fetch live payroll data
  const { data: payrollData, isLoading: payrollLoading } = useQuery({
    queryKey: ['payroll-live-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('payroll')
        .select('id, employee_id, salary_paid, payment_status, overtime_pay, base_pay')
        .order('payment_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isOpen && (statType === 'total' || statType === 'pending')
  });

  // Fetch live attendance data for overtime
  const { data: attendanceData, isLoading: attendanceLoading } = useQuery({
    queryKey: ['attendance-live-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attendance')
        .select('id, employee_id, overtime_minutes, date')
        .gte('date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: isOpen && statType === 'total'
  });

  const getModalContent = () => {
    const isLoading = employeesLoading || payrollLoading || attendanceLoading;

    switch (statType) {
      case 'employees':
        return {
          title: 'Total Employees',
          icon: <Users className="h-5 w-5" />,
          content: (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{formatNumber(employees?.length || 0)}</span>
                <Badge variant="secondary">Active</Badge>
              </div>
              
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {employees?.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.job_title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(employee.salary)}</p>
                        <Badge variant="outline" className="text-xs">
                          {employee.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        };

      case 'total':
        const totalPayroll = payrollData?.reduce((sum, record) => sum + (record.salary_paid || 0), 0) || 0;
        const totalOvertime = attendanceData?.reduce((sum, record) => sum + (record.overtime_minutes || 0), 0) || 0;
        
        return {
          title: 'Monthly Payroll',
          icon: <DollarSign className="h-5 w-5" />,
          content: (
            <div className="space-y-4">
              <div className="text-2xl font-bold">{formatCurrency(totalPayroll)}</div>
              
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(2)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">Base Pay</span>
                    <span className="font-medium">
                      {formatCurrency(payrollData?.reduce((sum, r) => sum + (r.base_pay || 0), 0) || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="text-sm font-medium">Overtime Pay</span>
                    <span className="font-medium">
                      {formatCurrency(payrollData?.reduce((sum, r) => sum + (r.overtime_pay || 0), 0) || 0)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <span className="text-sm font-medium">Total Overtime Hours</span>
                    <span className="font-medium">
                      {Math.round(totalOvertime / 60)} hours
                    </span>
                  </div>
                </div>
              )}
            </div>
          )
        };

      case 'pending':
        const pendingPayslips = payrollData?.filter(record => 
          record.payment_status === 'pending' || record.payment_status === 'processing'
        ) || [];
        
        return {
          title: 'Pending Payslips',
          icon: <FileText className="h-5 w-5" />,
          content: (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{formatNumber(pendingPayslips.length)}</span>
                <Badge variant="outline">To be processed</Badge>
              </div>
              
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pendingPayslips.map((payslip) => {
                    const employee = employees?.find(emp => emp.id === payslip.employee_id);
                    return (
                      <div key={payslip.id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <p className="font-medium">{employee?.name || 'Unknown Employee'}</p>
                          <p className="text-sm text-gray-600">
                            {employee?.job_title || 'No title'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(payslip.salary_paid)}</p>
                          <Badge variant="outline" className="text-xs">
                            {payslip.payment_status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  
                  {pendingPayslips.length === 0 && (
                    <div className="text-center py-6 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>No pending payslips</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        };

      case 'paid':
        const paidEmployees = employees?.filter(emp => emp.status === 'Active') || [];
        
        return {
          title: 'Paid Employees',
          icon: <Users className="h-5 w-5" />,
          content: (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{formatNumber(paidEmployees.length)}</span>
                <Badge className="bg-green-100 text-green-800">Paid</Badge>
              </div>
              
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {paidEmployees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.job_title}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(employee.salary)}</p>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          Paid
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        };

      case 'absent':
        return {
          title: 'Absent Employees',
          icon: <Clock className="h-5 w-5" />,
          content: (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{statValue}</span>
                <Badge variant="secondary">Absent</Badge>
              </div>
              
              <div className="text-center py-6 text-gray-500">
                <Clock className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No absent employees today</p>
              </div>
            </div>
          )
        };

      default:
        return {
          title: 'Details',
          icon: null,
          content: <div>No data available</div>
        };
    }
  };

  const modalData = getModalContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {modalData.icon}
            {modalData.title}
          </DialogTitle>
        </DialogHeader>
        
        <div className="mt-4">
          {modalData.content}
        </div>
      </DialogContent>
    </Dialog>
  );
};
