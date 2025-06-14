
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useDeleteEmployee, Employee as DbEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { Employee, mapDbEmployeeToUiEmployee } from '../types';
import EmployeeHeader from './employee-details/EmployeeHeader';
import EmployeeInfoSection from './employee-details/EmployeeInfoSection';
import DeleteConfirmationDialog from './employee-details/DeleteConfirmationDialog';
import AddEmployeeModal from './AddEmployeeModal';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmployeeDetailsModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: string, status: string) => void;
  onEdit?: (employee: Employee) => void;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  employee,
  isOpen,
  onClose,
  onStatusChange,
  onEdit
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const deleteEmployee = useDeleteEmployee();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // Update current employee when prop changes
  useEffect(() => {
    console.log("Employee details modal - employee prop changed:", employee?.id, employee?.name);
    setCurrentEmployee(employee);
  }, [employee]);

  // Don't render if no employee is selected
  if (!currentEmployee) {
    console.log("No current employee, not rendering modal");
    return null;
  }

  const handleEdit = () => {
    if (onEdit) {
      onEdit(currentEmployee);
      onClose();
    } else {
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEmployee.mutateAsync(currentEmployee.id);
      setIsDeleteDialogOpen(false);
      onClose();
      toast({
        title: "Employee deleted",
        description: `${currentEmployee.name} has been removed successfully.`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error deleting employee:", error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete employee",
        variant: "destructive"
      });
    }
  };

  const handleClose = () => {
    console.log("Closing employee details modal");
    setCurrentEmployee(null);
    onClose();
  };

  // Convert UI Employee to DB Employee format
  const mapToDbEmployee = (uiEmployee: Employee): DbEmployee => {
    return {
      id: uiEmployee.id,
      name: uiEmployee.name,
      job_title: uiEmployee.jobTitle,
      department: uiEmployee.department,
      site: uiEmployee.site,
      salary: parseFloat(uiEmployee.salary.replace(/[^0-9.]/g, '')),
      start_date: new Date(uiEmployee.startDate).toISOString().split('T')[0],
      lifecycle: uiEmployee.lifecycle,
      status: uiEmployee.status,
      avatar: uiEmployee.avatar,
      location: uiEmployee.siteIcon === '🌐' ? 'Remote' : 'Office',
      annual_leave_days: uiEmployee.annual_leave_days || 25, 
      sick_leave_days: uiEmployee.sick_leave_days || 10,
      manager_id: uiEmployee.managerId || null,
      user_id: uiEmployee.userId || null,
      email: uiEmployee.email,
      role: uiEmployee.role,
      hourly_rate: uiEmployee.hourly_rate
    };
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className={`p-0 overflow-hidden rounded-2xl ${isMobile ? 'w-[95vw] max-w-[95vw]' : 'sm:max-w-[500px]'} max-h-[90vh] flex flex-col`}>
          <EmployeeHeader 
            employee={currentEmployee}
            onStatusChange={onStatusChange}
            onEdit={handleEdit}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
          <div className="flex-1 overflow-auto">
            <EmployeeInfoSection 
              employee={currentEmployee} 
              isEditing={false}
              onSave={() => {}}
            />
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        employee={currentEmployee}
        onDelete={handleDelete}
      />

      {isEditModalOpen && currentEmployee && (
        <AddEmployeeModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          departments={[]}
          sites={[]}
          employeeToEdit={mapToDbEmployee(currentEmployee)}
        />
      )}
    </>
  );
};

export default EmployeeDetailsModal;
