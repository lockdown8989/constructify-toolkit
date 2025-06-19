
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
  const isMobile = useIsMobile();

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

  // Convert UI Employee to DB Employee format for editing
  const mapToDbEmployee = (uiEmployee: Employee): DbEmployee => {
    // Parse the formatted salary string back to a number
    let salaryValue = 0;
    if (typeof uiEmployee.salary === 'string') {
      // Remove currency symbols and formatting, then parse
      const cleanSalary = uiEmployee.salary.replace(/[£$,\s]/g, '');
      salaryValue = parseFloat(cleanSalary) || 0;
    } else {
      salaryValue = uiEmployee.salary || 0;
    }

    // Convert formatted date back to ISO date string
    let startDateValue = new Date().toISOString().split('T')[0];
    if (uiEmployee.startDate) {
      try {
        // Parse the formatted date string and convert to ISO format
        const parsedDate = new Date(uiEmployee.startDate);
        if (!isNaN(parsedDate.getTime())) {
          startDateValue = parsedDate.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Error parsing start date:', error);
      }
    }

    return {
      id: uiEmployee.id,
      name: uiEmployee.name,
      job_title: uiEmployee.jobTitle || 'Employee',
      department: uiEmployee.department || 'General',
      site: uiEmployee.site || 'Main Office',
      salary: salaryValue,
      start_date: startDateValue,
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
      sunday_shift_id: uiEmployee.sunday_shift_id || null
    };
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`p-0 overflow-hidden rounded-2xl ${isMobile ? 'w-[95vw] max-w-[95vw]' : 'sm:max-w-[500px]'} max-h-[90vh] flex flex-col`}>
          <EmployeeHeader 
            employee={employee}
            onStatusChange={onStatusChange}
            onEdit={handleEdit}
            onDelete={() => setIsDeleteDialogOpen(true)}
          />
          <div className="flex-1 overflow-auto">
            <EmployeeInfoSection employee={employee} />
          </div>
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
          onOpenChange={(open) => {
            setIsEditModalOpen(open);
            if (!open) {
              // Refresh the parent modal data when edit modal closes
              onClose();
            }
          }}
          departments={[]}
          sites={[]}
          employeeToEdit={mapToDbEmployee(employee)}
        />
      )}
    </>
  );
};

export default EmployeeDetailsModal;
