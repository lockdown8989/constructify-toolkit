
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2 } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { DialogTitle } from '@/components/ui/dialog';
import EmployeeStatusDropdown from './EmployeeStatusDropdown';
import { Employee } from '@/components/people/types';

interface EmployeeHeaderProps {
  employee: Employee;
  onStatusChange?: (id: string, status: string) => void;
  onEdit?: () => void;
  onDelete: () => void;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
  employee,
  onStatusChange,
  onEdit,
  onDelete,
}) => {
  const statusColors = {
    green: 'bg-apple-green/15 text-apple-green hover:bg-apple-green/15',
    gray: 'bg-apple-gray-200 text-apple-gray-700 hover:bg-apple-gray-200'
  };

  const handleStatusChange = (status: string) => {
    if (onStatusChange) {
      onStatusChange(employee.id, status);
    }
  };

  return (
    <div className="bg-apple-gray-50 p-6 rounded-t-xl">
      <div className="flex items-start gap-4">
        <Avatar className="h-16 w-16 border-2 border-white shadow-sm">
          <AvatarImage src={employee.avatar} alt={employee.name} />
          <AvatarFallback>{getInitials(employee.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <DialogTitle className="text-xl font-semibold mb-1 text-apple-gray-900">{employee.name}</DialogTitle>
          <p className="text-apple-gray-600 text-sm mb-2">{employee.jobTitle}</p>
          <Badge variant="outline" className={statusColors[employee.statusColor]}>
            {employee.status}
          </Badge>
        </div>
        <div className="flex gap-2">
          {onStatusChange && (
            <EmployeeStatusDropdown onStatusChange={handleStatusChange} />
          )}
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full" 
            title="Edit Employee"
            onClick={onEdit}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full hover:bg-red-50 hover:text-red-500 hover:border-red-200" 
            title="Delete Employee"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHeader;
