
import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Employee {
  id: string;
  name: string;
  avatar: string;
  title: string;
  salary: string;
  status: 'Paid' | 'Absent' | 'Pending';
  selected?: boolean;
}

interface SalaryTableProps {
  employees: Employee[];
  onSelectEmployee?: (id: string) => void;
  className?: string;
}

const SalaryTable: React.FC<SalaryTableProps> = ({ 
  employees, 
  onSelectEmployee,
  className 
}) => {
  return (
    <div className={cn("bg-white rounded-3xl p-6 card-shadow", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium">Salary</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="pl-9 pr-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
      </div>
      
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="pb-4 font-medium w-6"></th>
              <th className="pb-4 font-medium">Name</th>
              <th className="pb-4 font-medium">Job Title</th>
              <th className="pb-4 font-medium">Net Salary</th>
              <th className="pb-4 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {employees.map(employee => (
              <tr 
                key={employee.id} 
                className={cn(
                  "group transition-colors hover:bg-gray-50",
                  employee.selected && "bg-crextio-accent/10"
                )}
              >
                <td className="py-4">
                  <div className="flex items-center justify-center h-5">
                    <input
                      type="checkbox"
                      checked={employee.selected}
                      onChange={() => onSelectEmployee?.(employee.id)}
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalaryTable;
