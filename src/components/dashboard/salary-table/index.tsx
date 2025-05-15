
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
    
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    
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
      baseSalary: typeof employee.salary === 'number' ? employee.salary : 0,
      grossPay: typeof employee.salary === 'number' ? employee.salary : 0,
      deductions: 0,
      netPay: typeof employee.salary === 'number' ? employee.salary : 0,
      currency: 'USD'
    };
    
    downloadPayslip(payslipData);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4 flex-col sm:flex-row gap-3">
        <SearchBar onSearch={handleSearch} />
        <StatusFilter onFilterChange={setStatusFilter} activeFilter={statusFilter} />
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
              <SalaryTableRow
                key={employee.id}
                employee={employee}
                onDownload={() => handlePayslipDownload(employee)}
                onStatusChange={onStatusChange}
              />
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
