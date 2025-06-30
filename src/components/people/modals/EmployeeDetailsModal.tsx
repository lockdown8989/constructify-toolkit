
import React, { useState } from 'react';
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
  onEdit?: (employee: Employee) => void;
}

const EmployeeDetailsModal: React.FC<EmployeeDetailsModalProps> = ({
  employee,
  isOpen,
  onClose,
  onEdit
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const deleteEmployee = useDeleteEmployee();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  if (!employee) return null;

  const handleEdit = () => {
    console.log('Opening edit modal for employee:', employee);
    setIsEditModalOpen(true);
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

  const handleEditModalClose = () => {
    console.log('Edit modal closing');
    setIsEditModalOpen(false);
  };

  // Convert UI Employee to DB Employee format for editing
  const mapToDbEmployee = (uiEmployee: Employee): DbEmployee => {
    console.log('Converting UI Employee to DB Employee:', uiEmployee);
    
    return {
      id: uiEmployee.id,
      name: uiEmployee.name || '',
      job_title: uiEmployee.jobTitle || '',
      department: uiEmployee.department || '',
      site: uiEmployee.site || '',
      salary: typeof uiEmployee.salary === 'string' 
        ? parseFloat(uiEmployee.salary.replace(/[^0-9.]/g, '')) || 0
        : uiEmployee.salary || 0,
      start_date: uiEmployee.startDate 
        ? new Date(uiEmployee.startDate).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      lifecycle: uiEmployee.lifecycle || 'Active',
      status: uiEmployee.status || 'Active',
      avatar: uiEmployee.avatar,
      location: uiEmployee.siteIcon === '🌐' ? 'Remote' : 'Office',
      annual_leave_days: uiEmployee.annual_leave_days || 25,
      sick_leave_days: uiEmployee.sick_leave_days || 10,
      manager_id: uiEmployee.managerId || null,
      user_id: uiEmployee.userId || null,
      email: uiEmployee.email,
      role: uiEmployee.role || 'employee',
      hourly_rate: uiEmployee.hourly_rate || null,
      shift_pattern_id: uiEmployee.shift_pattern_id || null,
      monday_shift_id: uiEmployee.monday_shift_id || null,
      tuesday_shift_id: uiEmployee.tuesday_shift_id || null,
      wednesday_shift_id: uiEmployee.wednesday_shift_id || null,
      thursday_shift_id: uiEmployee.thursday_shift_id || null,
      friday_shift_id: uiEmployee.friday_shift_id || null,
      saturday_shift_id: uiEmployee.saturday_shift_id || null,
      sunday_shift_id: uiEmployee.sunday_shift_id || null,
      monday_available: uiEmployee.monday_available ?? true,
      monday_start_time: uiEmployee.monday_start_time || '09:00',
      monday_end_time: uiEmployee.monday_end_time || '17:00',
      tuesday_available: uiEmployee.tuesday_available ?? true,
      tuesday_start_time: uiEmployee.tuesday_start_time || '09:00',
      tuesday_end_time: uiEmployee.tuesday_end_time || '17:00',
      wednesday_available: uiEmployee.wednesday_available ?? true,
      wednesday_start_time: uiEmployee.wednesday_start_time || '09:00',
      wednesday_end_time: uiEmployee.wednesday_end_time || '17:00',
      thursday_available: uiEmployee.thursday_available ?? true,
      thursday_start_time: uiEmployee.thursday_start_time || '09:00',
      thursday_end_time: uiEmployee.thursday_end_time || '17:00',
      friday_available: uiEmployee.friday_available ?? true,
      friday_start_time: uiEmployee.friday_start_time || '09:00',
      friday_end_time: uiEmployee.friday_end_time || '17:00',
      saturday_available: uiEmployee.saturday_available ?? true,
      saturday_start_time: uiEmployee.saturday_start_time || '09:00',
      saturday_end_time: uiEmployee.saturday_end_time || '17:00',
      sunday_available: uiEmployee.sunday_available ?? true,
      sunday_start_time: uiEmployee.sunday_start_time || '09:00',
      sunday_end_time: uiEmployee.sunday_end_time || '17:00',
    };
  };

  const dbEmployee = mapToDbEmployee(employee);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`p-0 overflow-hidden rounded-2xl ${isMobile ? 'w-[95vw] max-w-[95vw]' : 'sm:max-w-[500px]'} max-h-[90vh] flex flex-col`}>
          <EmployeeHeader 
            employee={employee}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
          <div className="flex-1 overflow-auto">
            <EmployeeInfoSection 
              employee={employee} 
              isEditing={false}
              onSave={() => {}}
              onEdit={handleEdit}
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

      <AddEmployeeModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        employeeToEdit={dbEmployee}
      />
    </>
  );
};

export default EmployeeDetailsModal;
