
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Briefcase, 
  Building2, 
  MapPin, 
  Calendar 
} from 'lucide-react';
import { Employee } from '@/components/people/types';
import SalaryField from './SalaryField';

interface EmploymentDetailsCardProps {
  employee: Employee;
  isEditing: boolean;
  onInputChange: (field: keyof Employee, value: string | number) => void;
}

const EmploymentDetailsCard: React.FC<EmploymentDetailsCardProps> = ({
  employee,
  isEditing,
  onInputChange
}) => {
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

  const getLifecycleColor = (lifecycle: string) => {
    switch (lifecycle.toLowerCase()) {
      case 'full-time':
        return 'bg-blue-100 text-blue-800';
      case 'part-time':
        return 'bg-purple-100 text-purple-800';
      case 'agency worker':
        return 'bg-orange-100 text-orange-800';
      case 'contractor':
        return 'bg-indigo-100 text-indigo-800';
      case 'intern':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
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
              value={employee.jobTitle}
              onChange={(e) => onInputChange('jobTitle', e.target.value)}
              className="mt-1"
            />
          ) : (
            <p className="text-gray-900 font-medium">{employee.jobTitle}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="department">Department</Label>
          {isEditing ? (
            <Input
              id="department"
              value={employee.department}
              onChange={(e) => onInputChange('department', e.target.value)}
              className="mt-1"
            />
          ) : (
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-gray-500" />
              <span>{employee.department}</span>
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="site">Site/Location</Label>
          {isEditing ? (
            <Input
              id="site"
              value={employee.site}
              onChange={(e) => onInputChange('site', e.target.value)}
              className="mt-1"
            />
          ) : (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span>{employee.site}</span>
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          {isEditing ? (
            <Input
              id="start_date"
              type="date"
              value={new Date(employee.startDate).toISOString().split('T')[0]}
              onChange={(e) => onInputChange('startDate', new Date(e.target.value).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long', 
                day: 'numeric'
              }))}
              className="mt-1"
            />
          ) : (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span>{employee.startDate}</span>
            </div>
          )}
        </div>
        
        <div>
          <Label htmlFor="employment_status">Employment Status</Label>
          {isEditing ? (
            <Select
              value={employee.lifecycle}
              onValueChange={(value) => onInputChange('lifecycle', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select employment status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="agency worker">Agency Worker</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="intern">Intern</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge className={getLifecycleColor(employee.lifecycle)}>
              {employee.lifecycle}
            </Badge>
          )}
        </div>
        
        <div>
          <Label htmlFor="status">Current Status</Label>
          {isEditing ? (
            <Select
              value={employee.status}
              onValueChange={(value) => onInputChange('status', value)}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <Badge className={getStatusColor(employee.status)}>
              {employee.status}
            </Badge>
          )}
        </div>
        
        <SalaryField 
          employee={employee}
          isEditing={isEditing}
          onInputChange={onInputChange}
        />
      </div>
    </Card>
  );
};

export default EmploymentDetailsCard;
