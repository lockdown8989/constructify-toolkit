
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle, Mail, Users, Clock } from 'lucide-react';

interface EmployeeStatusDropdownProps {
  onStatusChange: (status: string) => void;
}

const EmployeeStatusDropdown: React.FC<EmployeeStatusDropdownProps> = ({
  onStatusChange,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-full h-9 w-9 p-0">
          <Clock className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onStatusChange('Active')}>
          <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
          <span>Set as Active</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('Inactive')}>
          <XCircle className="mr-2 h-4 w-4 text-gray-500" />
          <span>Set as Inactive</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('Invited')}>
          <Mail className="mr-2 h-4 w-4 text-blue-500" />
          <span>Set as Invited</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('Absent')}>
          <Users className="mr-2 h-4 w-4 text-orange-500" />
          <span>Set as Absent</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default EmployeeStatusDropdown;
