
import React, { useState, useMemo } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useUpdateEmployee } from '@/hooks/use-employees';

const PeopleTable: React.FC<PeopleTableProps> = ({
  employees,
  onSelectEmployee,
  onUpdateStatus,
  className,
  isLoading = false
}) => {
  const { isManager } = useAuth();
  const { toast } = useToast();
  const updateEmployee = useUpdateEmployee();
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [expandedEmployee, setExpandedEmployee] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<EmployeeType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const isMobile = useIsMobile();
  
  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) {
      return employees;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return employees.filter(employee => 
      employee.name.toLowerCase().includes(query) ||
      employee.jobTitle.toLowerCase().includes(query) ||
      employee.department.toLowerCase().includes(query) ||
      employee.site.toLowerCase().includes(query)
    );
  }, [employees, searchQuery]);
  
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedEmployees(filteredEmployees.map(emp => emp.id));
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
    setSelectedEmployeeDetails(employee);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEmployeeDetails(null);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedEmployeeDetails(null);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      console.log('PeopleTable handleStatusChange:', id, status);
      
      // Update the employee status using the mutation
      await updateEmployee.mutateAsync({ 
        id, 
        status,
        lifecycle: status === 'Active' ? 'Active' : status === 'Inactive' ? 'Inactive' : 'Active'
      });
      
      toast({
        title: "Status Updated",
        description: `Employee status has been updated to ${status}.`,
      });

      // Call the parent component's onUpdateStatus if provided
      if (onUpdateStatus) {
        onUpdateStatus(id, status);
      }
    } catch (error) {
      console.error("Error updating employee status:", error);
      toast({
        title: "Error",
        description: "Failed to update employee status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEditEmployee = (employee: EmployeeType) => {
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
    <div className={cn("bg-white overflow-hidden", className)}>
      {/* Table controls */}
      <TableControls 
        isMobile={isMobile} 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCount={selectedEmployees.length}
      />
      
      {isManager && filteredEmployees.length === 0 && !searchQuery && (
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-2 font-medium">No team members connected yet</p>
          <p className="text-sm text-gray-500">
            Share your Manager ID with employees so they can connect to your account
          </p>
        </div>
      )}

      {filteredEmployees.length === 0 && searchQuery && (
        <div className="p-8 text-center">
          <p className="text-gray-600 mb-2 font-medium">No team members found</p>
          <p className="text-sm text-gray-500">
            Try adjusting your search terms or filters
          </p>
        </div>
      )}
      
      {/* Desktop Table */}
      {!isMobile && (
        <DesktopTable 
          employees={filteredEmployees}
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
          employees={filteredEmployees}
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
      />

      {/* Edit Employee Modal */}
      {selectedEmployeeDetails && isEditModalOpen && (
        <AddEmployeeModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          employeeToEdit={mapToDbEmployee(selectedEmployeeDetails)}
        />
      )}
    </div>
  );
};

export default PeopleTable;
