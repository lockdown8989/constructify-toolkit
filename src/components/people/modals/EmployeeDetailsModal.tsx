
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useDeleteEmployee, Employee as DbEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { Employee, mapDbEmployeeToUiEmployee } from '../types';
import EmployeeHeader from './employee-details/EmployeeHeader';
import EmployeeInfoSection from './employee-details/EmployeeInfoSection';
import DeleteConfirmationDialog from './employee-details/DeleteConfirmationDialog';
import AddEmployeeModal from './AddEmployeeModal';

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
  const deleteEmployee = useDeleteEmployee();
  const { toast } = useToast();

  if (!employee) return null;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(employee);
      onClose();
    } else {
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEmployee.mutateAsync(employee.id);
      setIsDeleteDialogOpen(false);
      onClose();
      toast({
        title: "Employee deleted",
        description: `${employee.name} has been removed successfully.`,
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

  // Convert UI Employee to DB Employee format
  const mapToDbEmployee = (uiEmployee: Employee): DbEmployee => {
    return {
      id: uiEmployee.id,
      name: uiEmployee.name,
      job_title: uiEmployee.jobTitle,
      department: uiEmployee.department,
      site: uiEmployee.site,
      salary: parseInt(uiEmployee.salary.replace(/[^0-9]/g, '')),
      start_date: new Date(uiEmployee.startDate).toISOString().split('T')[0],
      lifecycle: uiEmployee.lifecycle,
      status: uiEmployee.status,
      avatar: uiEmployee.avatar,
      location: uiEmployee.siteIcon === '🌐' ? 'Remote' : 'Office',
      annual_leave_days: 25, // Default values
      sick_leave_days: 10,    // Default values
      manager_id: uiEmployee.managerId || null,
      user_id: uiEmployee.userId || null
    };
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
          <EmployeeHeader 
            employee={employee}
            onStatusChange={onStatusChange}
            onEdit={handleEdit}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
          <EmployeeInfoSection employee={employee} />
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        employee={employee}
        onDelete={handleDelete}
      />

      {isEditModalOpen && (
        <AddEmployeeModal
          open={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          departments={[]}
          sites={[]}
          employeeToEdit={mapToDbEmployee(employee)}
        />
      )}
    </>
  );
};

export default EmployeeDetailsModal;
