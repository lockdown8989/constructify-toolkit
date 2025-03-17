
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import TableControls from './table/TableControls';
import DesktopTable from './table/DesktopTable';
import MobileTable from './table/MobileTable';
import TableSkeleton from './table/TableSkeleton';
import { PeopleTableProps } from './types';

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
        <TableSkeleton isMobile={isMobile} />
      </div>
    );
  }
  
  return (
    <div className={cn("bg-white rounded-3xl card-shadow", className)}>
      {/* Table controls */}
      <TableControls isMobile={isMobile} />
      
      {/* Desktop Table */}
      {!isMobile && (
        <DesktopTable 
          employees={employees}
          selectedEmployees={selectedEmployees}
          onSelectEmployee={handleSelectEmployee}
          onSelectAll={handleSelectAll}
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
        />
      )}
    </div>
  );
};

export default PeopleTable;
