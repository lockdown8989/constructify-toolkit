
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, MapPin, Mail, Phone, DollarSign, Edit2, Save, X } from 'lucide-react';
import { Employee } from '@/hooks/use-employees';
import { useUpdateEmployee } from '@/hooks/use-employees';
import { useToast } from '@/hooks/use-toast';

interface EmployeeInfoSectionProps {
  employee: Employee;
}

const EmployeeInfoSection: React.FC<EmployeeInfoSectionProps> = ({ employee }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState(employee);
  const updateEmployeeMutation = useUpdateEmployee();
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      await updateEmployeeMutation.mutateAsync({
        ...editedEmployee,
        lifecycle: editedEmployee.lifecycle || 'Active' // Ensure lifecycle is present
      });
      setIsEditing(false);
      toast({
        title: "Success",
        description: "Employee information updated successfully",
      });
    } catch (error) {
      console.error('Error updating employee:', error);
      toast({
        title: "Error",
        description: "Failed to update employee information",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditedEmployee(employee);
    setIsEditing(false);
  };

  const handleInputChange = (field: keyof Employee, value: string | number) => {
    setEditedEmployee(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Employee Information
        </CardTitle>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={updateEmployeeMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            {isEditing ? (
              <Input
                id="name"
                value={editedEmployee.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
              />
            ) : (
              <p className="text-sm text-gray-700">{employee.name}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="job_title">Job Title</Label>
            {isEditing ? (
              <Input
                id="job_title"
                value={editedEmployee.job_title}
                onChange={(e) => handleInputChange('job_title', e.target.value)}
              />
            ) : (
              <p className="text-sm text-gray-700">{employee.job_title}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="department">Department</Label>
            {isEditing ? (
              <Input
                id="department"
                value={editedEmployee.department}
                onChange={(e) => handleInputChange('department', e.target.value)}
              />
            ) : (
              <p className="text-sm text-gray-700">{employee.department}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="site">Site</Label>
            {isEditing ? (
              <Input
                id="site"
                value={editedEmployee.site}
                onChange={(e) => handleInputChange('site', e.target.value)}
              />
            ) : (
              <p className="text-sm text-gray-700">{employee.site}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            {isEditing ? (
              <Input
                id="email"
                type="email"
                value={editedEmployee.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            ) : (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-700">{employee.email || 'Not provided'}</p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="salary">Salary</Label>
            {isEditing ? (
              <Input
                id="salary"
                type="number"
                value={editedEmployee.salary}
                onChange={(e) => handleInputChange('salary', parseFloat(e.target.value))}
              />
            ) : (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-700">${employee.salary?.toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={employee.status === 'Active' ? 'default' : 'secondary'}>
            {employee.status}
          </Badge>
          <Badge variant="outline">
            {employee.lifecycle || 'Active'}
          </Badge>
          {employee.location && (
            <Badge variant="outline" className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {employee.location}
            </Badge>
          )}
        </div>

        {employee.start_date && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <CalendarDays className="h-4 w-4" />
              <span>Started: {new Date(employee.start_date).toLocaleDateString()}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeeInfoSection;
