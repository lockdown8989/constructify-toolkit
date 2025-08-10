
import React from 'react';
import { cn } from '@/lib/utils';
import { Employee } from './types';
import { PayslipActions } from './PayslipActions';
import { StatusActions } from './StatusActions';
import { useAuth } from '@/hooks/use-auth';

interface TableRowProps {
  employee: Employee;
  isProcessing: boolean;
  onSelectEmployee: (id: string) => void;
  onStatusChange: (id: string, status: 'Paid' | 'Absent' | 'Pending') => void;
  onDownloadPayslip: (employee: Employee) => Promise<void>;
  onAttachToResume: (employee: Employee) => Promise<void>;
}

const TableRowComponent: React.FC<TableRowProps> = ({
  employee,
  isProcessing,
  onSelectEmployee,
  onStatusChange,
  onDownloadPayslip,
  onAttachToResume,
}) => {
  const { isManager } = useAuth();
  
  return (
    <tr className={cn(
      "group transition-colors hover:bg-gray-50",
      employee.selected && "bg-crextio-accent/10"
    )}>
      <td className="py-4">
        <div className="flex items-center justify-center h-5">
          <input
            type="checkbox"
            checked={employee.selected}
            onChange={() => onSelectEmployee(employee.id)}
            className="rounded border-gray-300 text-black focus:ring-black"
          />
        </div>
      </td>
      <td className="py-4">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full overflow-hidden mr-3">
            <img 
              src={employee.avatar} 
              alt={employee.name}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="font-medium">{employee.name}</span>
        </div>
      </td>
      <td className="py-4 text-gray-600">{employee.title}</td>
      <td className="py-4 font-medium">{employee.salary}</td>
      <td className="py-4">
        <span className={cn(
          "inline-block px-3 py-1 rounded-full text-xs font-medium",
          employee.status === 'Paid' && "bg-crextio-success/20 text-green-700",
          employee.status === 'Absent' && "bg-gray-200 text-gray-700",
          employee.status === 'Pending' && "bg-crextio-accent/20 text-yellow-700"
        )}>
          {employee.status}
        </span>
      </td>
      <td className="py-4 text-sm text-gray-500">
        {employee.paymentDate || '-'}
      </td>
      <td className="py-4">
        <div className="flex items-center gap-2">
          {(employee.status === 'Paid' || !isManager) && (
            <PayslipActions
              employee={employee}
              isProcessing={isProcessing}
              onDownload={onDownloadPayslip}
              onAttach={onAttachToResume}
            />
          )}
          {isManager && (
            <StatusActions
              onStatusChange={(status) => onStatusChange(employee.id, status)}
            />
          )}
        </div>
      </td>
    </tr>
  );
};

export const TableRow = React.memo(TableRowComponent);

