
import React from 'react';

interface EmployeeTableHeaderProps {
  onSelectAll: (e: React.ChangeEvent<HTMLInputElement>) => void;
  allSelected: boolean;
  hasEmployees: boolean;
}

const EmployeeTableHeader: React.FC<EmployeeTableHeaderProps> = ({ 
  onSelectAll, 
  allSelected,
  hasEmployees 
}) => {
  return (
    <thead>
      <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
        <th className="py-4 px-6 font-medium w-6">
          <input
            type="checkbox"
            checked={allSelected && hasEmployees}
            onChange={onSelectAll}
            disabled={!hasEmployees}
            className="rounded border-gray-300 text-black focus:ring-black"
          />
        </th>
        <th className="py-4 px-6 font-medium">Name</th>
        <th className="py-4 px-6 font-medium">
          <div className="flex items-center">
            Job title
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4">
              <path d="M9.44566 3.2871C9.44566 2.99909 9.19332 2.7598 8.89311 2.7598C8.59291 2.7598 8.34056 2.99909 8.34056 3.2871C8.34056 3.57512 8.59291 3.81441 8.89311 3.81441C9.19332 3.81441 9.44566 3.57512 9.44566 3.2871Z" fill="currentColor"></path>
            </svg>
          </div>
        </th>
        <th className="py-4 px-6 font-medium">
          <div className="flex items-center">
            Department
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4">
              <path d="M9.44566 3.2871C9.44566 2.99909 9.19332 2.7598 8.89311 2.7598C8.59291 2.7598 8.34056 2.99909 8.34056 3.2871C8.34056 3.57512 8.59291 3.81441 8.89311 3.81441C9.19332 3.81441 9.44566 3.57512 9.44566 3.2871Z" fill="currentColor"></path>
            </svg>
          </div>
        </th>
        <th className="py-4 px-6 font-medium">
          <div className="flex items-center">
            Site
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4">
              <path d="M9.44566 3.2871C9.44566 2.99909 9.19332 2.7598 8.89311 2.7598C8.59291 2.7598 8.34056 2.99909 8.34056 3.2871C8.34056 3.57512 8.59291 3.81441 8.89311 3.81441C9.19332 3.81441 9.44566 3.57512 9.44566 3.2871Z" fill="currentColor"></path>
            </svg>
          </div>
        </th>
        <th className="py-4 px-6 font-medium">
          <div className="flex items-center">
            Salary
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4">
              <path d="M9.44566 3.2871C9.44566 2.99909 9.19332 2.7598 8.89311 2.7598C8.59291 2.7598 8.34056 2.99909 8.34056 3.2871C8.34056 3.57512 8.59291 3.81441 8.89311 3.81441C9.19332 3.81441 9.44566 3.57512 9.44566 3.2871Z" fill="currentColor"></path>
            </svg>
          </div>
        </th>
        <th className="py-4 px-6 font-medium">
          <div className="flex items-center">
            Start date
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4">
              <path d="M9.44566 3.2871C9.44566 2.99909 9.19332 2.7598 8.89311 2.7598C8.59291 2.7598 8.34056 2.99909 8.34056 3.2871C8.34056 3.57512 8.59291 3.81441 8.89311 3.81441C9.19332 3.81441 9.44566 3.57512 9.44566 3.2871Z" fill="currentColor"></path>
            </svg>
          </div>
        </th>
        <th className="py-4 px-6 font-medium">
          <div className="flex items-center">
            Lifecycle
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4">
              <path d="M9.44566 3.2871C9.44566 2.99909 9.19332 2.7598 8.89311 2.7598C8.59291 2.7598 8.34056 2.99909 8.34056 3.2871C8.34056 3.57512 8.59291 3.81441 8.89311 3.81441C9.19332 3.81441 9.44566 3.57512 9.44566 3.2871Z" fill="currentColor"></path>
            </svg>
          </div>
        </th>
        <th className="py-4 px-6 font-medium">
          <div className="flex items-center">
            Status
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="ml-1 h-4 w-4">
              <path d="M9.44566 3.2871C9.44566 2.99909 9.19332 2.7598 8.89311 2.7598C8.59291 2.7598 8.34056 2.99909 8.34056 3.2871C8.34056 3.57512 8.59291 3.81441 8.89311 3.81441C9.19332 3.81441 9.44566 3.57512 9.44566 3.2871Z" fill="currentColor"></path>
            </svg>
          </div>
        </th>
      </tr>
    </thead>
  );
};

export default EmployeeTableHeader;
