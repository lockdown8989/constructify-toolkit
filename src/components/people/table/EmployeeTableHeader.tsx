
import React from 'react';

interface EmployeeTableHeaderProps {
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allSelected: boolean;
  hasEmployees: boolean;
}

const EmployeeTableHeader: React.FC<EmployeeTableHeaderProps> = ({
  onSelectAll,
  allSelected,
  hasEmployees,
}) => {
  return (
    <thead className="bg-gray-50">
      <tr>
        <th scope="col" className="py-3.5 px-4 text-left w-12">
          <input
            type="checkbox"
            checked={allSelected}
            onChange={onSelectAll}
            disabled={!hasEmployees}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
        </th>
        <th scope="col" className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Employee
        </th>
        <th scope="col" className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Department
        </th>
        <th scope="col" className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Location
        </th>
        <th scope="col" className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Salary
        </th>
        <th scope="col" className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Start Date
        </th>
        <th scope="col" className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Lifecycle
        </th>
        <th scope="col" className="py-3.5 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
          Status
        </th>
        <th scope="col" className="py-3.5 px-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
          Actions
        </th>
      </tr>
    </thead>
  );
};

export default EmployeeTableHeader;
