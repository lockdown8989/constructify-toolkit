
import React, { useState } from 'react';
import { Separator } from '@/components/ui/separator';
import { FileText } from 'lucide-react';
import { Employee } from '@/components/people/types';
import { useUpdateEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import DocumentsSection from './DocumentsSection';
import PersonalInfoCard from './PersonalInfoCard';
import EmploymentDetailsCard from './EmploymentDetailsCard';
import EmployeeActionButtons from './EmployeeActionButtons';

interface EmployeeInfoSectionProps {
  employee: Employee;
  isEditing: boolean;
  onSave: () => void;
}

const EmployeeInfoSection: React.FC<EmployeeInfoSectionProps> = ({
  employee,
  isEditing: externalIsEditing,
  onSave: externalOnSave
}) => {
  const [isEditing, setIsEditing] = useState(externalIsEditing);
  const [editedEmployee, setEditedEmployee] = useState<Employee>(employee);
  const updateEmployee = useUpdateEmployee();
  const { toast } = useToast();

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedEmployee(employee);
  };

  const handleSave = async () => {
    try {
      // Parse salary properly - remove currency symbols and commas
      const salaryValue = typeof editedEmployee.salary === 'string' 
        ? parseFloat(editedEmployee.salary.replace(/[£$,\s]/g, '')) || 0
        : editedEmployee.salary;

      console.log('Saving employee with salary:', salaryValue);

      // Convert UI employee back to database format
      await updateEmployee.mutateAsync({
        id: employee.id,
        name: editedEmployee.name,
        job_title: editedEmployee.jobTitle,
        department: editedEmployee.department,
        site: editedEmployee.site,
        salary: salaryValue,
        status: editedEmployee.status.toLowerCase(),
        email: editedEmployee.email,
        role: editedEmployee.role,
        lifecycle: editedEmployee.lifecycle,
        location: editedEmployee.siteIcon === '🌐' ? 'Remote' : 'Office',
        start_date: new Date(editedEmployee.startDate).toISOString().split('T')[0]
      });

      // Show success confirmation message
      toast({
        title: "Employee Updated Successfully",
        description: `${editedEmployee.name}'s profile has been updated and saved.`,
        variant: "default"
      });

      setIsEditing(false);
      externalOnSave();
    } catch (error) {
      console.error('Error updating employee:', error);
      // Show error message
      toast({
        title: "Update Failed",
        description: "Failed to update employee information. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleInputChange = (field: keyof Employee, value: string | number) => {
    setEditedEmployee(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const currentEmployee = isEditing ? editedEmployee : employee;

  return (
    <div className="space-y-6">
      <EmployeeActionButtons
        isEditing={isEditing}
        isSubmitting={updateEmployee.isPending}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        externalIsEditing={externalIsEditing}
      />

      <PersonalInfoCard
        employee={currentEmployee}
        isEditing={isEditing}
        onInputChange={handleInputChange}
      />

      <EmploymentDetailsCard
        employee={currentEmployee}
        isEditing={isEditing}
        onInputChange={handleInputChange}
      />

      <Separator />

      <div>
        <div className="flex items-center gap-2 mb-4">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Documents</h3>
        </div>
        <DocumentsSection 
          employeeId={employee.id}
          employeeName={employee.name}
        />
      </div>
    </div>
  );
};

export default EmployeeInfoSection;
