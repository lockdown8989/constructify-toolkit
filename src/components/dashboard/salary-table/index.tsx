
import React, { useState } from 'react';
import { Employee } from './types';
import { useIsMobile } from '@/hooks/use-mobile';
import { generatePayslipPDF } from '@/utils/exports/payslip-generator';
import TableRow from './TableRow';
import SearchBar from './SearchBar';
import PayslipActions from './PayslipActions';
import StatusActions from './StatusActions';
import StatusFilter from './StatusFilter';

interface SalaryTableProps {
  employees: Employee[];
  onSelectEmployee?: (id: string) => void;
}

const SalaryTable: React.FC<SalaryTableProps> = ({ employees, onSelectEmployee }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const isMobile = useIsMobile();
  
  // Filter employees based on search term and status filter
  const filteredEmployees = employees.filter(employee => {
    // Filter by search term
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          employee.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by status
    const matchesStatus = statusFilter === 'all' || employee.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Function to handle payslip download
  const handleGeneratePayslip = async (employee: Employee) => {
    const payslipData = {
      name: employee.name,
      title: employee.title,
      department: employee.department,
      salary: employee.salary,
      paymentDate: new Date().toLocaleDateString()
    };
    
    const pdfBlob = await generatePayslipPDF(payslipData);
    
    // Create object URL for downloading
    const url = URL.createObjectURL(pdfBlob);
    
    // Create download link and click it
    const a = document.createElement('a');
    a.href = url;
    a.download = `${employee.name.replace(/\s/g, '_')}_payslip.pdf`;
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
      {/* Table header with search and filters */}
      <div className="p-4 border-b">
        <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
          <StatusFilter value={statusFilter} onChange={setStatusFilter} />
        </div>
      </div>
      
      {/* Table body */}
      <div className={`${filteredEmployees.length === 0 ? 'border-b' : ''}`}>
        {filteredEmployees.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No employees found matching your criteria
          </div>
        ) : (
          <div>
            {filteredEmployees.map((employee, index) => (
              <TableRow 
                key={employee.id} 
                employee={employee}
                isLast={index === filteredEmployees.length - 1}
                isSelected={employee.selected || false}
                onSelect={() => onSelectEmployee && onSelectEmployee(employee.id)}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Table footer with status and payslip actions */}
      {!isMobile && (
        <div className="p-4 border-t">
          <div className="flex justify-between">
            <StatusActions />
            <PayslipActions onGeneratePayslip={() => {
              const selectedEmployee = employees.find(e => e.selected);
              if (selectedEmployee) {
                handleGeneratePayslip(selectedEmployee);
              }
            }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default SalaryTable;
