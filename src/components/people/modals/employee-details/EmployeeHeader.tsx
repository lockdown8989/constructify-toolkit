
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Pencil } from 'lucide-react';
import { getInitials } from '@/lib/utils';
import { DialogTitle, DialogClose } from '@/components/ui/dialog';
import EmployeeStatusDropdown from './EmployeeStatusDropdown';
import { Employee } from '@/components/people/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  const isMobile = useIsMobile();
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
    <div className="bg-gradient-to-br from-apple-gray-50 to-apple-gray-100/60 p-4 sm:p-6 rounded-t-xl backdrop-blur-sm">
      <div className={`flex items-start ${isMobile ? 'flex-col gap-4' : 'gap-5'}`}>
        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-2 border-white shadow-sm rounded-2xl">
          <AvatarImage src={employee.avatar} alt={employee.name} className="object-cover" />
          <AvatarFallback className="text-lg font-medium bg-apple-blue text-white">{getInitials(employee.name)}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <DialogTitle className="text-xl sm:text-2xl font-semibold mb-1 text-apple-gray-900">{employee.name}</DialogTitle>
          <p className="text-apple-gray-600 text-sm mb-3">{employee.jobTitle}</p>
          <Badge variant="outline" className={statusColors[employee.statusColor]}>
            {employee.status}
          </Badge>
        </div>
        
        <div className={`flex gap-2 ${isMobile ? 'self-end' : ''}`}>
          {onStatusChange && (
            <EmployeeStatusDropdown onStatusChange={handleStatusChange} />
          )}
          {onEdit && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full border-apple-blue/30 bg-white/80 hover:bg-apple-blue/5 shadow-sm transition-all duration-300 ease-in-out" 
                    onClick={onEdit}
                  >
                    <Pencil className="h-4 w-4 text-apple-blue stroke-[2.5px] transition-transform hover:scale-110" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-apple-gray-900 text-white">
                  <p>Edit Employee Details</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <Button 
            variant="outline" 
            size="icon"
            className="rounded-full border-red-200/30 bg-white/80 hover:bg-red-50 hover:text-red-500 shadow-sm" 
            title="Delete Employee"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-apple-gray-700 transition-transform hover:scale-110" />
          </Button>
          <DialogClose asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full border-apple-gray-200/30 bg-white/80 shadow-sm" 
              title="Close"
            >
              <X className="h-4 w-4 text-apple-gray-700" />
            </Button>
          </DialogClose>
        </div>
      </div>
    </div>
  );
};

export default EmployeeHeader;

