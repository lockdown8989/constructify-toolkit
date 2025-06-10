
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Mail, 
  MapPin, 
  Calendar, 
  Briefcase, 
  Building2, 
  DollarSign, 
  Edit3,
  Save,
  X,
  FileText
} from 'lucide-react';
import { Employee } from '@/components/people/types';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUpdateEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';
import DocumentsSection from './DocumentsSection';

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
      // Convert UI employee back to database format
      await updateEmployee.mutateAsync({
        id: employee.id,
        name: editedEmployee.name,
        job_title: editedEmployee.jobTitle,
        department: editedEmployee.department,
        site: editedEmployee.site,
        salary: parseFloat(editedEmployee.salary.replace(/[^0-9.]/g, '')),
        status: editedEmployee.status,
        email: editedEmployee.email,
        role: editedEmployee.role,
        start_date: new Date(editedEmployee.startDate).toISOString().split('T')[0]
      });

      toast({
        title: "Employee Updated",
        description: "Employee information has been successfully updated.",
      });

      setIsEditing(false);
      externalOnSave();
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update employee information.",
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const currentEmployee = isEditing ? editedEmployee : employee;

  return (
    <div className="space-y-6">
      {/* Action Buttons */}
      {!externalIsEditing && (
        <div className="flex justify-end gap-2">
          {isEditing ? (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={updateEmployee.isPending}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                disabled={updateEmployee.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                {updateEmployee.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          ) : (
            <Button onClick={handleEdit}>
              <Edit3 className="h-4 w-4 mr-2" />
              Edit Employee
            </Button>
          )}
        </div>
      )}

      {/* Personal Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <User className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Personal Information</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={currentEmployee.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="text-gray-900 font-medium">{currentEmployee.name}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={currentEmployee.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="mt-1"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <span>{currentEmployee.email || 'Not provided'}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Employment Information */}
      <Card className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Employment Details</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="job_title">Job Title</Label>
            {isEditing ? (
              <Input
                id="job_title"
                value={currentEmployee.jobTitle}
                onChange={(e) => handleInputChange('jobTitle', e.target.value)}
                className="mt-1"
              />
            ) : (
              <p className="text-gray-900 font-medium">{currentEmployee.jobTitle}</p>
            )}
          </div>
          
          <div>
            <Label htmlFor="department">Department</Label>
            {isEditing ? (
              <Input
                id="department"
                value={currentEmployee.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
                className="mt-1"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <span>{currentEmployee.department}</span>
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="site">Site/Location</Label>
            {isEditing ? (
              <Input
                id="site"
                value={currentEmployee.site}
                onChange={(e) => handleInputChange('site', e.target.value)}
                className="mt-1"
              />
            ) : (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-gray-500" />
                <span>{currentEmployee.site}</span>
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="start_date">Start Date</Label>
            {isEditing ? (
              <Input
                id="start_date"
                type="date"
                value={new Date(currentEmployee.startDate).toISOString().split('T')[0]}
                onChange={(e) => handleInputChange('startDate', new Date(e.target.value).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric'
                }))}
                className="mt-1"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span>{currentEmployee.startDate}</span>
              </div>
            )}
          </div>
          
          <div>
            <Label htmlFor="status">Status</Label>
            {isEditing ? (
              <Select
                value={currentEmployee.status}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            ) : (
              <Badge className={getStatusColor(currentEmployee.status)}>
                {currentEmployee.status}
              </Badge>
            )}
          </div>
          
          <div>
            <Label htmlFor="salary">Salary</Label>
            {isEditing ? (
              <Input
                id="salary"
                type="text"
                value={currentEmployee.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                className="mt-1"
              />
            ) : (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <span>{currentEmployee.salary}</span>
              </div>
            )}
          </div>
        </div>
      </Card>

      <Separator />

      {/* Documents Section */}
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
