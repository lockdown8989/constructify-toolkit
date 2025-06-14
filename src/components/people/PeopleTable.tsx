
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';
import TableControls from './table/TableControls';
import DesktopTable from './table/DesktopTable';
import MobileTable from './table/MobileTable';
import TableSkeleton from './table/TableSkeleton';
import EmployeeDetailsModal from './modals/EmployeeDetailsModal';
import { PeopleTableProps, Employee as EmployeeType } from './types';
import AddEmployeeModal from './modals/AddEmployeeModal';
import { Employee as DbEmployee } from '@/hooks/use-employees';
import { useAuth } from '@/hooks/use-auth';

const PeopleTable: React.FC<PeopleTableProps> = ({
  employees,
  onSelectEmployee,
  onUpdateStatus,
  className,
  isLoading = false
}) => {
  const { isManager } = useAuth();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<EmployeeType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
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

  const handleEmployeeClick = (employee: EmployeeType) => {
    console.log("Employee clicked:", employee.id, employee.name);
    // Ensure we're setting the specific employee that was clicked
    setSelectedEmployeeDetails(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    console.log("Closing modal, clearing selected employee");
    setIsModalOpen(false);
    setSelectedEmployeeDetails(null); // Clear the selected employee when closing
  };

  const handleStatusChange = (id: string, status: string) => {
    if (onUpdateStatus) {
      onUpdateStatus(id, status);
    }
  };

  const handleEditEmployee = (employee: EmployeeType) => {
    console.log("Edit employee clicked:", employee.id, employee.name);
    setSelectedEmployeeDetails(employee);
    setIsEditModalOpen(true);
  };

  const mapToDbEmployee = (employee: EmployeeType): DbEmployee => {
    return {
      id: employee.id,
      name: employee.name,
      job_title: employee.jobTitle,
      department: employee.department,
      site: employee.site,
      salary: parseInt(employee.salary.replace(/[^0-9]/g, '')),
      start_date: new Date(employee.startDate).toISOString().split('T')[0],
      lifecycle: employee.lifecycle,
      status: employee.status,
      avatar: employee.avatar,
      location: employee.siteIcon === '🌐' ? 'Remote' : 'Office',
      annual_leave_days: 25,
      sick_leave_days: 10,
      manager_id: employee.managerId || null,
      user_id: employee.userId || null
    };
  };
  
  if (isLoading) {
    return (
      <div className={cn("bg-white", className)}>
        <TableSkeleton isMobile={isMobile} />
      </div>
    );
  }

  return (
    <div className={cn("bg-white", className)}>
      {/* Table controls */}
      <TableControls 
        isMobile={isMobile} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCount={selectedEmployees.length}
      />
      
      {isManager && employees.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-2 font-medium">No team members connected yet</p>
          <p className="text-sm text-gray-500">
            Share your Manager ID with employees so they can connect to your account
          </p>
        </div>
      )}
      
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

      {/* Employee Details Modal - Only show if we have a specific employee selected */}
      {selectedEmployeeDetails && (
        <EmployeeDetailsModal 
          employee={selectedEmployeeDetails}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onStatusChange={handleStatusChange}
          onEdit={handleEditEmployee}
        />
      )}

      {/* Edit Employee Modal */}
      {selectedEmployeeDetails && isEditModalOpen && (
        <AddEmployeeModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          departments={[]}
          sites={[]}
          employeeToEdit={mapToDbEmployee(selectedEmployeeDetails)}
        />
      )}
    </div>
  );
};

export default PeopleTable;
