
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { formatCurrency } from '@/utils/format';

interface Employee {
  id: string;
  name: string;
  position: string;
  salary: number;
  status: 'Paid' | 'Pending' | 'Absent';
  department: string;
}

interface EmployeeListModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  employees: Employee[];
  statusFilter?: 'Paid' | 'Pending' | 'Absent';
}

export const EmployeeListModal: React.FC<EmployeeListModalProps> = ({
  isOpen,
  onClose,
  title,
  employees,
  statusFilter
}) => {
  const filteredEmployees = statusFilter 
    ? employees.filter(emp => emp.status === statusFilter)
    : employees;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Paid':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Paid</Badge>;
      case 'Pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'Absent':
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100">Absent</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {filteredEmployees.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-gray-500">
                No employees found for this status.
              </CardContent>
            </Card>
          ) : (
            filteredEmployees.map((employee) => (
              <Card key={employee.id} className="hover:shadow-sm transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-medium text-gray-900">{employee.name}</h4>
                        <p className="text-sm text-gray-500">{employee.position}</p>
                        <p className="text-xs text-gray-400">{employee.department}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        {formatCurrency(employee.salary)}
                      </p>
                      {getStatusBadge(employee.status)}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
