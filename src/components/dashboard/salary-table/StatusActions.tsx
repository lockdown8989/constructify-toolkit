
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatusActionsProps {
  onStatusChange: (status: 'Paid' | 'Pending' | 'Absent') => void;
}

export const StatusActions: React.FC<StatusActionsProps> = ({ onStatusChange }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <span className="hidden sm:inline">Update</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => onStatusChange('Paid')}>
          Mark as Paid
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('Pending')}>
          Mark as Pending
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('Absent')}>
          Mark as Absent
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
