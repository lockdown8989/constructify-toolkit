
import React from 'react';
import { cn } from '@/lib/utils';
import EmployeeTableHeader from './EmployeeTableHeader';
import { EmployeeTableRow } from './EmployeeTableRow';
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
  // Convert Employee from people/types to types/employee format
  const convertEmployee = (emp: Employee) => ({
    id: emp.id,
    name: emp.name,
    job_title: emp.jobTitle,
    department: emp.department,
    site: emp.site,
    salary: typeof emp.salary === 'string' ? parseInt(emp.salary.replace(/[^0-9]/g, '')) : emp.salary || 0,
    status: emp.status,
    employment_type: emp.employment_type,
    start_date: emp.startDate,
    lifecycle: emp.lifecycle,
    user_id: emp.userId,
    manager_id: emp.managerId,
    email: emp.email,
    hourly_rate: emp.hourly_rate,
    role: emp.role,
    annual_leave_days: emp.annual_leave_days,
    sick_leave_days: emp.sick_leave_days,
    avatar: emp.avatar
  });

  const handleStatusChange = (employee: any, newStatus: string) => {
    if (onStatusChange) {
      onStatusChange(employee.id, newStatus);
    }
  };

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
                employee={convertEmployee(employee)}
                isSelected={selectedEmployees.includes(employee.id)}
                onSelect={onSelectEmployee}
                onRowClick={onEmployeeClick}
                onStatusChange={handleStatusChange}
                isUpdating={false}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DesktopTable;
