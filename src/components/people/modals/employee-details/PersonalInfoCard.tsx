
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User, Mail } from 'lucide-react';
import { Employee } from '@/components/people/types';

interface PersonalInfoCardProps {
  employee: Employee;
  isEditing: boolean;
  onInputChange: (field: keyof Employee, value: string | number) => void;
}

const PersonalInfoCard: React.FC<PersonalInfoCardProps> = ({
  employee,
  isEditing,
  onInputChange
}) => {
  return (
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
              value={employee.name}
              onChange={(e) => onInputChange('name', e.target.value)}
              className="mt-1"
            />
          ) : (
            <p className="text-gray-900 font-medium">{employee.name}</p>
          )}
        </div>
        
        <div>
          <Label htmlFor="email">Email</Label>
          {isEditing ? (
            <Input
              id="email"
              type="email"
              value={employee.email || ''}
              onChange={(e) => onInputChange('email', e.target.value)}
              className="mt-1"
            />
          ) : (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-gray-500" />
              <span>{employee.email || 'Not provided'}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default PersonalInfoCard;
