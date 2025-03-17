
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import TableControls from './table/TableControls';
import DesktopTable from './table/DesktopTable';
import MobileTable from './table/MobileTable';
import TableSkeleton from './table/TableSkeleton';
import EmployeeDetailsModal from './modals/EmployeeDetailsModal';
import { PeopleTableProps } from './types';

const PeopleTable: React.FC<PeopleTableProps> = ({
  employees,
  onSelectEmployee,
  onUpdateStatus,
  className,
  isLoading = false
}) => {
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<typeof employees[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
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

  const handleEmployeeClick = (employee: typeof employees[0]) => {
    setSelectedEmployeeDetails(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleStatusChange = (id: string, status: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(id, status);
    }
  };
  
  if (isLoading) {
    return (
      <div className={cn("bg-white rounded-3xl card-shadow", className)}>
        <TableSkeleton isMobile={isMobile} />
      </div>
    );
  }
  
  return (
    <div className={cn("bg-white rounded-3xl card-shadow", className)}>
      {/* Table controls */}
      <TableControls 
        isMobile={isMobile} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCount={selectedEmployees.length}
      />
      
      {/* Desktop Table */}
      {!isMobile && (
        <DesktopTable 
          employees={employees}
          selectedEmployees={selectedEmployees}
          onSelectEmployee={handleSelectEmployee}
          onSelectAll={handleSelectAll}
          onEmployeeClick={handleEmployeeClick}
          onStatusChange={handleStatusChange}
        />
      )}
      
      {/* Mobile Card View */}
      {isMobile && (
        <MobileTable 
          employees={employees}
          selectedEmployees={selectedEmployees}
          expandedEmployee={expandedEmployee}
          onSelectEmployee={handleSelectEmployee}
          onToggleExpand={toggleExpandEmployee}
          onEmployeeClick={handleEmployeeClick}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Employee Details Modal */}
      <EmployeeDetailsModal 
        employee={selectedEmployeeDetails}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default PeopleTable;
