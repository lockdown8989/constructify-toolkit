
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatNumber } from '@/utils/format';
import { DollarSign, Users, Calendar, TrendingUp, Eye } from 'lucide-react';
import { EmployeeListModal } from './EmployeeListModal';

interface PayrollDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'total-payroll' | 'total-employees' | 'paid' | 'pending' | 'absent';
  data: {
    totalPayroll: number;
    totalEmployees: number;
    paidEmployees: number;
    pendingEmployees: number;
    absentEmployees: number;
  };
}

// Mock employee data - in a real app this would come from your API
const mockEmployees = [
  { id: '1', name: 'John Smith', position: 'Software Engineer', salary: 75000, status: 'Paid' as const, department: 'Engineering' },
  { id: '2', name: 'Sarah Johnson', position: 'Product Manager', salary: 85000, status: 'Paid' as const, department: 'Product' },
  { id: '3', name: 'Mike Wilson', position: 'Designer', salary: 65000, status: 'Pending' as const, department: 'Design' },
  { id: '4', name: 'Lisa Brown', position: 'HR Manager', salary: 70000, status: 'Absent' as const, department: 'HR' },
];

export const PayrollDetailModal: React.FC<PayrollDetailModalProps> = ({
  isOpen,
  onClose,
  type,
  data
}) => {
  const [showEmployeeList, setShowEmployeeList] = useState(false);
  const [employeeListTitle, setEmployeeListTitle] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Paid' | 'Pending' | 'Absent' | undefined>(undefined);

  const handleViewEmployees = (status?: 'Paid' | 'Pending' | 'Absent', title?: string) => {
    setStatusFilter(status);
    setEmployeeListTitle(title || 'All Employees');
    setShowEmployeeList(true);
  };

  const getModalContent = () => {
    switch (type) {
      case 'total-payroll':
        return {
          title: 'Total Payroll Details',
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Payroll Breakdown
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Gross Pay</span>
                    <span className="font-semibold">{formatCurrency(data.totalPayroll)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Average per Employee</span>
                    <span className="font-semibold">
                      {formatCurrency(data.totalEmployees > 0 ? data.totalPayroll / data.totalEmployees : 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Processing Period</span>
                    <span className="font-semibold">Current Month</span>
                  </div>
                </CardContent>
              </Card>
              <Button 
                onClick={() => handleViewEmployees(undefined, 'All Employees - Payroll Details')}
                className="w-full"
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All Employees
              </Button>
            </div>
          )
        };

      case 'total-employees':
        return {
          title: 'Employee Overview',
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-blue-600" />
                    Employee Statistics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Active Employees</span>
                    <span className="font-semibold">{formatNumber(data.totalEmployees)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Processed This Period</span>
                    <span className="font-semibold">{formatNumber(data.paidEmployees + data.pendingEmployees)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Processing Rate</span>
                    <span className="font-semibold">
                      {data.totalEmployees > 0 ? 
                        Math.round(((data.paidEmployees + data.pendingEmployees) / data.totalEmployees) * 100) : 0}%
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Button 
                onClick={() => handleViewEmployees(undefined, 'All Employees')}
                className="w-full"
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                View All Employees
              </Button>
            </div>
          )
        };

      case 'paid':
        return {
          title: 'Paid Employees',
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    Payment Status: Completed
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Employees Paid</span>
                    <span className="font-semibold text-green-600">{formatNumber(data.paidEmployees)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Payment Success Rate</span>
                    <span className="font-semibold text-green-600">
                      {data.totalEmployees > 0 ? 
                        Math.round((data.paidEmployees / data.totalEmployees) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Payment Date</span>
                    <span className="font-semibold">{new Date().toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
              <Button 
                onClick={() => handleViewEmployees('Paid', 'Paid Employees')}
                className="w-full"
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Paid Employees
              </Button>
            </div>
          )
        };

      case 'pending':
        return {
          title: 'Pending Payments',
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-amber-600" />
                    Payment Status: Pending
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Employees Pending</span>
                    <span className="font-semibold text-amber-600">{formatNumber(data.pendingEmployees)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Estimated Processing Time</span>
                    <span className="font-semibold">1-2 Business Days</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Next Processing Date</span>
                    <span className="font-semibold">
                      {new Date(Date.now() + 86400000).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
              <Button 
                onClick={() => handleViewEmployees('Pending', 'Pending Employees')}
                className="w-full"
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Pending Employees
              </Button>
            </div>
          )
        };

      case 'absent':
        return {
          title: 'Absent Employees',
          content: (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-600" />
                    Attendance Status: Absent
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Absent Employees</span>
                    <span className="font-semibold text-gray-600">{formatNumber(data.absentEmployees)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Absence Rate</span>
                    <span className="font-semibold">
                      {data.totalEmployees > 0 ? 
                        Math.round((data.absentEmployees / data.totalEmployees) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Impact on Payroll</span>
                    <span className="font-semibold">Requires Review</span>
                  </div>
                </CardContent>
              </Card>
              <Button 
                onClick={() => handleViewEmployees('Absent', 'Absent Employees')}
                className="w-full"
                variant="outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                View Absent Employees
              </Button>
            </div>
          )
        };

      default:
        return { title: '', content: null };
    }
  };

  const { title, content } = getModalContent();

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>

      <EmployeeListModal
        isOpen={showEmployeeList}
        onClose={() => setShowEmployeeList(false)}
        title={employeeListTitle}
        employees={mockEmployees}
        statusFilter={statusFilter}
      />
    </>
  );
};
