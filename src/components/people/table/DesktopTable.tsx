
import React from 'react';
import { cn } from '@/lib/utils';
import EmployeeTableHeader from './EmployeeTableHeader';
import EmployeeTableRow from './EmployeeTableRow';
import { Employee } from '../types';

interface DesktopTableProps {
  employees: Employee[];
  selectedEmployees: string[];
  onSelectEmployee: (id: string) => void;
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onEmployeeClick?: (employee: Employee) => void;
  onStatusChange?: (id: string, status: string) => void;
}

const DesktopTable: React.FC<DesktopTableProps> = ({
  employees,
  selectedEmployees,
  onSelectEmployee,
  onSelectAll,
  onEmployeeClick,
  onStatusChange,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200 table-fixed">
        <EmployeeTableHeader 
          onSelectAll={onSelectAll} 
          allSelected={selectedEmployees.length === employees.length && employees.length > 0}
          hasEmployees={employees.length > 0}
        />
        <tbody className="divide-y divide-gray-200 bg-white">
          {employees.length === 0 ? (
            <tr>
              <td colSpan={9} className="py-12 text-center text-gray-500">
                <p className="text-base">No team members found</p>
                <p className="text-sm mt-1 text-gray-400">Try adjusting your filters or adding new team members</p>
              </td>
            </tr>
          ) : (
            employees.map(employee => (
              <EmployeeTableRow
                key={employee.id}
                employee={employee}
                isSelected={selectedEmployees.includes(employee.id)}
                onSelect={onSelectEmployee}
                onRowClick={onEmployeeClick}
                onStatusChange={onStatusChange}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DesktopTable;
