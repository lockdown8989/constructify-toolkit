
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface StatusActionsProps {
  onStatusChange: (status: 'Paid' | 'Pending' | 'Absent') => void;
  employeeId?: string; // Add this for compatibility
  onUpdateStatus?: (id: string, status: 'Paid' | 'Pending' | 'Absent') => void; // Add this for compatibility
}

export const StatusActions: React.FC<StatusActionsProps> = ({ 
  onStatusChange, 
  employeeId, 
  onUpdateStatus 
}) => {
  const handleStatusChange = (status: 'Paid' | 'Pending' | 'Absent') => {
    if (onStatusChange) onStatusChange(status);
    if (onUpdateStatus && employeeId) onUpdateStatus(employeeId, status);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <span className="hidden sm:inline">Update</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleStatusChange('Paid')}>
          Mark as Paid
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('Pending')}>
          Mark as Pending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleStatusChange('Absent')}>
          Mark as Absent
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
