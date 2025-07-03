
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useDeleteEmployee, Employee as DbEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import { Employee, mapDbEmployeeToUiEmployee } from '../types';
import EmployeeHeader from './employee-details/EmployeeHeader';
import EmployeeInfoSection from './employee-details/EmployeeInfoSection';
import DeleteConfirmationDialog from './employee-details/DeleteConfirmationDialog';
import EmployeeAccountEditDialog from './employee-details/EmployeeAccountEditDialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmployeeDetailsModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (employee: Employee) => void;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  employee,
  isOpen,
  onClose,
  onEdit
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAccountEditDialogOpen, setIsAccountEditDialogOpen] = useState(false);
  const deleteEmployee = useDeleteEmployee();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  if (!employee) return null;

  const handleEditAccount = () => {
    console.log('Opening account edit dialog for employee:', employee);
    setIsAccountEditDialogOpen(true);
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

  const handleAccountEditDialogClose = () => {
    console.log('Account edit dialog closing');
    setIsAccountEditDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`p-0 overflow-hidden ${isMobile ? 'w-[95vw] max-w-[95vw] max-h-[95vh]' : 'sm:max-w-[600px] max-h-[90vh]'} flex flex-col border-0 shadow-2xl`}>
          <EmployeeHeader 
            employee={employee}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onEditAccount={handleEditAccount}
          />
          <div className="flex-1 overflow-auto bg-gray-50">
            <EmployeeInfoSection 
              employee={employee} 
              isEditing={false}
              onSave={() => {}}
              onEdit={() => {}}
            />
          </div>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationDialog 
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        employee={employee}
        onDelete={handleDelete}
      />

      <EmployeeAccountEditDialog
        employee={employee}
        isOpen={isAccountEditDialogOpen}
        onClose={handleAccountEditDialogClose}
      />
    </>
  );
};

export default EmployeeDetailsModal;
