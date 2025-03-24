
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useDeleteEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { Employee } from '../types';
import EmployeeHeader from './employee-details/EmployeeHeader';
import EmployeeInfoSection from './employee-details/EmployeeInfoSection';
import DeleteConfirmationDialog from './employee-details/DeleteConfirmationDialog';

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
  const deleteEmployee = useDeleteEmployee();
  const { toast } = useToast();

  if (!employee) return null;

  const handleEdit = () => {
    if (onEdit) {
      onEdit(employee);
      onClose();
    } else {
      toast({
        title: "Edit functionality",
        description: "Edit functionality is not yet implemented",
        variant: "default"
      });
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
    </>
  );
};

export default EmployeeDetailsModal;
