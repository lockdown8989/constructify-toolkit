import React, { useState } from 'react';
import { Search, Plus, SlidersHorizontal, Download, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import { Skeleton } from '@/components/ui/skeleton';

interface Employee {
  id: string;
  avatar: string;
  name: string;
  jobTitle: string;
  department: string;
  site: string;
  siteIcon?: string;
  salary: string;
  startDate: string;
  lifecycle: string;
  status: string;
  statusColor: 'green' | 'gray';
  selected?: boolean;
}

interface PeopleTableProps {
  employees: Employee[];
  onSelectEmployee?: (id: string) => void;
  className?: string;
  isLoading?: boolean;
}

const PeopleTable: React.FC<PeopleTableProps> = ({
  employees,
  onSelectEmployee,
  className,
  isLoading = false
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEmployees(employees.map(emp => emp.id));
    } else {
      setSelectedEmployees([]);
    }
  };
  
  const handleSelectEmployee = (id: string) => {
    if (selectedEmployees.includes(id)) {
      setSelectedEmployees(selectedEmployees.filter(empId => empId !== id));
    } else {
      setSelectedEmployees([...selectedEmployees, id]);
    }
    
    if (onSelectEmployee) {
      onSelectEmployee(id);
    }
  };
  
  const toggleExpandEmployee = (id: string) => {
    setExpandedEmployee(expandedEmployee === id ? null : id);
  };
  
  if (isLoading) {
    return (
      <div className={cn("bg-white rounded-3xl card-shadow", className)}>
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {!isMobile && (
              <>
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-28" />
                <Skeleton className="h-10 w-20" />
              </>
            )}
          </div>
          <Skeleton className="h-10 w-[300px]" />
          <div className="flex items-center space-x-2 ml-auto">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
        
        {!isMobile ? (
          <div className="p-6">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="flex items-center space-x-4 mb-6">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-28" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-5 w-5 rounded" />
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-24 mb-1" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
  
  return (
    <div className={cn("bg-white rounded-3xl card-shadow", className)}>
      {/* Table controls */}
      <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-wrap items-center justify-between gap-4">
        {!isMobile && (
          <div className="flex flex-wrap items-center gap-2">
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              <span className="mr-2">Column</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor"></path>
              </svg>
            </button>
            
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              <span className="mr-2">Department</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor"></path>
              </svg>
            </button>
            
            <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
              <span className="mr-2">Site</span>
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor"></path>
              </svg>
            </button>
            
            {!isMobile && (
              <>
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <span className="mr-2">Lifecycle</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor"></path>
                  </svg>
                </button>
                
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <span className="mr-2">Status</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor"></path>
                  </svg>
                </button>
                
                <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium h-10 px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors">
                  <span className="mr-2">Entity</span>
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-4 w-4">
                    <path d="M3.13523 6.15803C3.3241 5.95657 3.64052 5.94637 3.84197 6.13523L7.5 9.56464L11.158 6.13523C11.3595 5.94637 11.6759 5.95657 11.8648 6.15803C12.0536 6.35949 12.0434 6.67591 11.842 6.86477L7.84197 10.6148C7.64964 10.7951 7.35036 10.7951 7.15803 10.6148L3.15803 6.86477C2.95657 6.67591 2.94637 6.35949 3.13523 6.15803Z" fill="currentColor"></path>
                  </svg>
                </button>
              </>
            )}
          </div>
        )}
        
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search"
            className="pl-9 pr-4 py-2 rounded-full bg-gray-100 text-sm w-full sm:w-[300px] focus:outline-none focus:ring-2 focus:ring-gray-200"
          />
        </div>
        
        <div className="flex items-center space-x-2 ml-auto">
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-full w-10 h-10 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            <Plus className="w-5 h-5" />
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-full w-10 h-10 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            <SlidersHorizontal className="w-5 h-5" />
          </button>
          <button className="inline-flex items-center justify-center whitespace-nowrap rounded-full w-10 h-10 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors">
            <Download className="w-5 h-5" />
          </button>
        </div>
      </div>
      
      {/* Desktop Table */}
      {!isMobile && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                <th className="py-4 px-6 font-medium w-6">
                  <input
                    type="checkbox"
                    checked={selectedEmployees.length === employees.length && employees.length > 0}
                    onChange={handleSelectAll}
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
            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-gray-500">
                    No employees found. Try adjusting your filters.
                  </td>
                </tr>
              ) : (
                employees.map(employee => (
                  <tr 
                    key={employee.id} 
                    className={cn(
                      "group transition-colors",
                      selectedEmployees.includes(employee.id) ? "bg-crextio-accent/10" : "hover:bg-gray-50"
                    )}
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center h-5">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(employee.id)}
                          onChange={() => handleSelectEmployee(employee.id)}
                          className="rounded border-gray-300 text-black focus:ring-black"
                        />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
                          <img 
                            src={employee.avatar} 
                            alt={employee.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-medium">{employee.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-600">{employee.jobTitle}</td>
                    <td className="py-4 px-6 text-gray-600">{employee.department}</td>
                    <td className="py-4 px-6">
                      <div className="flex items-center">
                        {employee.siteIcon && (
                          <span className="mr-2">{employee.siteIcon}</span>
                        )}
                        <span className="text-gray-600">{employee.site}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium">{employee.salary}</td>
                    <td className="py-4 px-6 text-gray-600">{employee.startDate}</td>
                    <td className="py-4 px-6 text-gray-600">{employee.lifecycle}</td>
                    <td className="py-4 px-6">
                      <span className={cn(
                        "inline-block px-3 py-1 rounded-full text-xs font-medium",
                        employee.statusColor === 'green' && "bg-crextio-success/20 text-green-700",
                        employee.statusColor === 'gray' && "bg-gray-200 text-gray-700"
                      )}>
                        {employee.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
      
      {/* Mobile Card View */}
      {isMobile && (
        <div className="divide-y divide-gray-100">
          {employees.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No employees found. Try adjusting your filters.
            </div>
          ) : (
            employees.map(employee => (
              <div 
                key={employee.id}
                className={cn(
                  "p-4 transition-colors",
                  selectedEmployees.includes(employee.id) ? "bg-crextio-accent/10" : ""
                )}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.includes(employee.id)}
                      onChange={() => handleSelectEmployee(employee.id)}
                      className="rounded border-gray-300 text-black focus:ring-black"
                    />
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      <img 
                        src={employee.avatar} 
                        alt={employee.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-gray-600">{employee.jobTitle}</div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => toggleExpandEmployee(employee.id)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100"
                  >
                    <ChevronRight 
                      className={cn(
                        "w-4 h-4 text-gray-600 transition-transform",
                        expandedEmployee === employee.id ? "transform rotate-90" : ""
                      )} 
                    />
                  </button>
                </div>
                
                {expandedEmployee === employee.id && (
                  <div className="mt-4 pl-10 space-y-2 animate-fade-in">
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Department:</div>
                      <div>{employee.department}</div>
                      
                      <div className="text-gray-500">Site:</div>
                      <div>{employee.site}</div>
                      
                      <div className="text-gray-500">Salary:</div>
                      <div className="font-medium">{employee.salary}</div>
                      
                      <div className="text-gray-500">Start date:</div>
                      <div>{employee.startDate}</div>
                      
                      <div className="text-gray-500">Lifecycle:</div>
                      <div>{employee.lifecycle}</div>
                      
                      <div className="text-gray-500">Status:</div>
                      <div>
                        <span className={cn(
                          "inline-block px-2 py-1 rounded-full text-xs font-medium",
                          employee.statusColor === 'green' && "bg-crextio-success/20 text-green-700",
                          employee.statusColor === 'gray' && "bg-gray-200 text-gray-700"
                        )}>
                          {employee.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PeopleTable;
