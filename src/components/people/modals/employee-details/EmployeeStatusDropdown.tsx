
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Mail, Users, Clock, PauseCircle } from 'lucide-react';

interface EmployeeStatusDropdownProps {
  currentStatus?: string;
  onStatusChange: (status: string) => void;
  disabled?: boolean;
}

const EmployeeStatusDropdown: React.FC<EmployeeStatusDropdownProps> = ({
  currentStatus,
  onStatusChange,
  disabled = false
}) => {
  const handleStatusChange = (newStatus: string) => {
    console.log('Status change requested:', newStatus);
    onStatusChange(newStatus);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="rounded-full h-9 w-9 p-0"
          disabled={disabled}
        >
          <Clock className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          onClick={() => handleStatusChange('Active')}
          className={currentStatus === 'Active' ? 'bg-accent' : ''}
        >
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          <span>Set as Active</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('Inactive')}
          className={currentStatus === 'Inactive' ? 'bg-accent' : ''}
        >
          <XCircle className="mr-2 h-4 w-4 text-gray-500" />
          <span>Set as Inactive</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('On Leave')}
          className={currentStatus === 'On Leave' ? 'bg-accent' : ''}
        >
          <PauseCircle className="mr-2 h-4 w-4 text-yellow-500" />
          <span>Set as On Leave</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('Invited')}
          className={currentStatus === 'Invited' ? 'bg-accent' : ''}
        >
          <Mail className="mr-2 h-4 w-4 text-blue-500" />
          <span>Set as Invited</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleStatusChange('Absent')}
          className={currentStatus === 'Absent' ? 'bg-accent' : ''}
        >
          <Users className="mr-2 h-4 w-4 text-orange-500" />
          <span>Set as Absent</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmployeeStatusDropdown;
