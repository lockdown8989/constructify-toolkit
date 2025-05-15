
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { downloadPayslip } from '@/utils/exports/payslip-generator';
import { TableRow as SalaryTableRow } from '@/components/dashboard/salary-table/TableRow';
import { SearchBar } from '@/components/dashboard/salary-table/SearchBar';
import { PayslipActions } from '@/components/dashboard/salary-table/PayslipActions';
import { StatusActions } from '@/components/dashboard/salary-table/StatusActions';
import { StatusFilter } from '@/components/dashboard/salary-table/StatusFilter';
import type { Employee, PayslipData } from '@/types/supabase/payroll';

interface SalaryTableProps {
  data: Employee[];
  onStatusChange?: (id: string, status: "Paid" | "Pending" | "Absent") => void;
}

export function SalaryTable({ data, onStatusChange }: SalaryTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter data based on search and status
  const filteredData = data.filter(item => {
    const matchesSearch = !searchTerm || 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (item.department && item.department.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || item.status?.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Handle search
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handlePayslipDownload = (employee: Employee) => {
    const payslipData: PayslipData = {
      id: employee.id,
      employeeId: employee.id,
      employeeName: employee.name,
      position: employee.title || employee.job_title || 'Employee',
      department: employee.department || 'N/A',
      period: `${new Date().toLocaleString('default', { month: 'long' })} ${new Date().getFullYear()}`,
      paymentDate: employee.paymentDate || new Date().toISOString(),
      baseSalary: typeof employee.salary === 'number' ? employee.salary : 
                 typeof employee.salary === 'string' ? parseInt(employee.salary.replace(/[^0-9]/g, ''), 10) : 0,
      grossPay: typeof employee.salary === 'number' ? employee.salary : 
               typeof employee.salary === 'string' ? parseInt(employee.salary.replace(/[^0-9]/g, ''), 10) : 0,
      deductions: 0,
      netPay: typeof employee.salary === 'number' ? employee.salary : 
             typeof employee.salary === 'string' ? parseInt(employee.salary.replace(/[^0-9]/g, ''), 10) : 0,
      currency: 'USD'
    };
    
    downloadPayslip(payslipData);
  };

  // Calculate status counts for the StatusFilter
  const statusCount = {
    All: filteredData.length,
    Paid: filteredData.filter(e => e.status === 'Paid').length,
    Pending: filteredData.filter(e => e.status === 'Pending').length,
    Absent: filteredData.filter(e => e.status === 'Absent').length
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4 flex-col sm:flex-row gap-3">
        <SearchBar value={searchTerm} onChange={handleSearch} />
        <StatusFilter 
          currentStatus="All" 
          onStatusChange={(status) => setStatusFilter(status.toLowerCase())}
          statusCount={statusCount}
          activeFilter={statusFilter}
          onFilterChange={setStatusFilter}
        />
      </div>
      
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Employee</TableHead>
              <TableHead>Salary</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((employee) => (
              <TableRow key={employee.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={employee.avatar} alt={employee.name} />
                      <AvatarFallback>{employee.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{employee.name}</div>
                      <div className="text-sm text-gray-500">{employee.title || employee.job_title}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{employee.salary}</TableCell>
                <TableCell>
                  <Badge variant={
                    employee.status === 'Paid' ? 'success' :
                    employee.status === 'Absent' ? 'outline' : 'warning'
                  }>
                    {employee.status}
                  </Badge>
                </TableCell>
                <TableCell>{employee.paymentDate || '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <PayslipActions
                      employee={employee}
                      isProcessing={false}
                      onDownload={() => handlePayslipDownload(employee)}
                      onAttach={async () => {}}
                    />
                    {onStatusChange && (
                      <StatusActions
                        onStatusChange={(status) => onStatusChange(employee.id, status)}
                      />
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            
            {filteredData.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No results found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
