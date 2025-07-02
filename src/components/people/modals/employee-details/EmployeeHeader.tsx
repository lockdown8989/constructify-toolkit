
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, X, Edit, Settings } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Employee } from '@/components/people/types';
import { useIsMobile } from '@/hooks/use-mobile';

interface EmployeeHeaderProps {
  employee: Employee;
  onEdit?: () => void;
  onEditAccount?: () => void;
  onDelete: () => void;
}

const EmployeeHeader: React.FC<EmployeeHeaderProps> = ({
  employee,
  onEdit,
  onEditAccount,
  onDelete,
}) => {
  const isMobile = useIsMobile();
  const statusColors = {
    green: 'bg-green-100 text-green-800 border-green-200',
    gray: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <div className="bg-white border-b border-gray-200 p-6 relative">
      {/* Close button */}
      <DialogClose asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-4 right-4 h-8 w-8 rounded-full hover:bg-gray-100" 
          title="Close"
        >
          <X className="h-4 w-4 text-gray-500" />
        </Button>
      </DialogClose>

      {/* Employee Profile Section */}
      <div className="flex flex-col items-center text-center space-y-4">
        {/* Avatar */}
        <div className="relative">
          <Avatar className="h-20 w-20 border-4 border-white shadow-lg">
            <AvatarImage src={employee.avatar || undefined} alt={employee.name} className="object-cover" />
            <AvatarFallback className="text-lg font-semibold bg-blue-500 text-white">
              {getInitials(employee.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Name and Title */}
        <div className="space-y-1">
          <DialogTitle className="text-2xl font-bold text-gray-900">
            {employee.name}
          </DialogTitle>
          <p className="text-gray-600 font-medium">{employee.jobTitle}</p>
        </div>

        {/* Status Badge */}
        <Badge 
          variant="outline" 
          className={`${statusColors[employee.statusColor]} font-medium px-3 py-1`}
        >
          {employee.status}
        </Badge>

        {/* Action Buttons */}
        <div className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-3 w-full max-w-xs`}>
          {onEdit && (
            <Button 
              onClick={onEdit}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors duration-200 flex items-center gap-2 flex-1"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </Button>
          )}
          
          {onEditAccount && (
            <Button 
              onClick={onEditAccount}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50 px-6 py-2 rounded-full font-medium transition-colors duration-200 flex items-center gap-2 flex-1"
            >
              <Settings className="h-4 w-4" />
              Edit Account
            </Button>
          )}
        </div>
      </div>

      {/* Delete button - positioned at bottom right, less prominent */}
      <Button 
        variant="ghost" 
        size="sm"
        className="absolute bottom-4 right-4 text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1 text-sm" 
        onClick={onDelete}
      >
        <Trash2 className="h-3 w-3 mr-1" />
        Delete
      </Button>
    </div>
  );
};

export default EmployeeHeader;
