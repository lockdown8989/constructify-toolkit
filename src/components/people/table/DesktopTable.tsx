
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
  // Responsive: grid of cards for large screens, table for xl with subtle shadow/pill layout
  return (
    <div className="overflow-x-auto w-full">
      <div className="hidden lg:grid grid-cols-2 xl:grid-cols-3 gap-6">
        {employees.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-gray-500 bg-white rounded-2xl shadow-sm">
            <p className="text-base">No team members found</p>
            <p className="text-sm mt-1 text-gray-400">Try adjusting your filters or adding new team members</p>
          </div>
        ) : (
          employees.map((employee) => (
            <div
              key={employee.id}
              className="bg-white rounded-2xl shadow-lg p-0 transition hover:shadow-2xl relative"
            >
              <table className="min-w-full table-fixed">
                <tbody>
                  <EmployeeTableRow
                    employee={employee}
                    isSelected={selectedEmployees.includes(employee.id)}
                    onSelect={onSelectEmployee}
                    onRowClick={onEmployeeClick}
                    onStatusChange={onStatusChange}
                  />
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
      {/* fallback: table view for non-lg screens */}
      <div className="lg:hidden">
        <table className="min-w-full divide-y divide-gray-200 table-fixed rounded-2xl overflow-hidden bg-white shadow-sm">
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
    </div>
  );
};

export default DesktopTable;

