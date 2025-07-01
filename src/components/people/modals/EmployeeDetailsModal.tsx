
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

  // Simplified conversion function
  const mapToDbEmployee = (uiEmployee: Employee): DbEmployee => {
    console.log('Converting UI Employee to DB Employee:', uiEmployee);
    
    try {
      // Parse salary safely
      let salaryValue = 0;
      if (typeof uiEmployee.salary === 'string') {
        const cleanSalary = uiEmployee.salary.replace(/[^0-9.]/g, '');
        salaryValue = parseFloat(cleanSalary) || 0;
      } else if (typeof uiEmployee.salary === 'number') {
        salaryValue = uiEmployee.salary;
      }

      // Parse date safely
      let startDateValue = new Date().toISOString().split('T')[0];
      if (uiEmployee.startDate) {
        try {
          const parsedDate = new Date(uiEmployee.startDate);
          if (!isNaN(parsedDate.getTime())) {
            startDateValue = parsedDate.toISOString().split('T')[0];
          }
        } catch (dateError) {
          console.warn('Date parsing error, using current date:', dateError);
        }
      }
    
      const dbEmployee: DbEmployee = {
        id: uiEmployee.id,
        name: uiEmployee.name || '',
        job_title: uiEmployee.jobTitle || '',
        department: uiEmployee.department || '',
        site: uiEmployee.site || '',
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
      };
      
      console.log('Converted to DB Employee:', dbEmployee);
      return dbEmployee;
    } catch (error) {
      console.error('Error converting employee data:', error);
      toast({
        title: "Conversion Error",
        description: "Failed to convert employee data for editing",
        variant: "destructive"
      });
      throw error;
    }
  };

  let dbEmployee: DbEmployee;
  try {
    dbEmployee = mapToDbEmployee(employee);
  } catch (error) {
    console.error('Failed to convert employee for editing:', error);
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-600 mb-2">Error Loading Employee</h3>
            <p className="text-gray-600">Unable to load employee data for editing.</p>
            <button 
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className={`p-0 overflow-hidden ${isMobile ? 'w-[95vw] max-w-[95vw] max-h-[95vh]' : 'sm:max-w-[600px] max-h-[90vh]'} flex flex-col border-0 shadow-2xl`}>
          <EmployeeHeader 
            employee={employee}
            onDelete={() => setIsDeleteDialogOpen(true)}
            onEdit={handleEdit}
          />
          <div className="flex-1 overflow-auto bg-gray-50">
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

      {isEditModalOpen && (
        <AddEmployeeModal
          isOpen={isEditModalOpen}
          onClose={handleEditModalClose}
          employeeToEdit={dbEmployee}
        />
      )}
    </>
  );
};

export default EmployeeDetailsModal;
