import React, { useState } from 'react';
import { Search, Filter, Download, ChevronDown, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { generatePayslipPDF } from '@/utils/export-utils';

interface Employee {
  id: string;
  name: string;
  avatar: string;
  title: string;
  salary: string;
  status: 'Paid' | 'Absent' | 'Pending';
  selected?: boolean;
  paymentDate?: string;
  department?: string;
}

interface SalaryTableProps {
  employees: Employee[];
  onSelectEmployee?: (id: string) => void;
  onUpdateStatus?: (id: string, status: 'Paid' | 'Absent' | 'Pending') => void;
  className?: string;
}

const SalaryTable: React.FC<SalaryTableProps> = ({ 
  employees, 
  onSelectEmployee,
  onUpdateStatus,
  className 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Absent' | 'Pending'>('All');
  
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          employee.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || employee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleStatusChange = (employeeId: string, newStatus: 'Paid' | 'Absent' | 'Pending') => {
    if (onUpdateStatus) {
      onUpdateStatus(employeeId, newStatus);
    }
  };
  
  const handleDownloadPayslip = (employee: Employee) => {
    generatePayslipPDF(employee.id, {
      name: employee.name,
      title: employee.title,
      salary: employee.salary,
      department: employee.department,
      paymentDate: employee.paymentDate
    });
  };
  
  const statusCount = {
    All: employees.length,
    Paid: employees.filter(e => e.status === 'Paid').length,
    Pending: employees.filter(e => e.status === 'Pending').length,
    Absent: employees.filter(e => e.status === 'Absent').length
  };

  return (
    <div className={cn("bg-white rounded-3xl p-6 card-shadow", className)}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-medium">Salary</h3>
        
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full bg-gray-100 text-sm focus:outline-none focus:ring-2 focus:ring-gray-200 w-[200px]"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                <span>Status: {statusFilter}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setStatusFilter('All')}>
                All ({statusCount.All})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Paid')}>
                Paid ({statusCount.Paid})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Pending')}>
                Pending ({statusCount.Pending})
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Absent')}>
                Absent ({statusCount.Absent})
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="icon">
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-sm text-gray-500">
              <th className="pb-4 font-medium w-6"></th>
              <th className="pb-4 font-medium">Name</th>
              <th className="pb-4 font-medium">Job Title</th>
              <th className="pb-4 font-medium">Net Salary</th>
              <th className="pb-4 font-medium">Status</th>
              <th className="pb-4 font-medium">Payment Date</th>
              <th className="pb-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEmployees.map(employee => (
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
                <td className="py-4 text-sm text-gray-500">
                  {employee.paymentDate || '-'}
                </td>
                <td className="py-4">
                  <div className="flex items-center gap-2">
                    {employee.status === 'Paid' && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="flex items-center gap-1 text-gray-600 hover:text-gray-900"
                              onClick={() => handleDownloadPayslip(employee)}
                            >
                              <FileText className="h-4 w-4" />
                              <span className="hidden sm:inline">Payslip</span>
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Download Payslip</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <span className="hidden sm:inline">Update</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => handleStatusChange(employee.id, 'Paid')}>
                          Mark as Paid
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(employee.id, 'Pending')}>
                          Mark as Pending
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(employee.id, 'Absent')}>
                          Mark as Absent
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
