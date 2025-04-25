
import React from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface StatusFilterProps {
  currentStatus: 'All' | 'Paid' | 'Absent' | 'Pending';
  onStatusChange: (status: 'All' | 'Paid' | 'Absent' | 'Pending') => void;
  statusCount: {
    All: number;
    Paid: number;
    Pending: number;
    Absent: number;
  };
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  currentStatus,
  onStatusChange,
  statusCount,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Filter className="h-4 w-4" />
          <span>Status: {currentStatus}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onStatusChange('All')}>
          All ({statusCount.All})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('Paid')}>
          Paid ({statusCount.Paid})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('Pending')}>
          Pending ({statusCount.Pending})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onStatusChange('Absent')}>
          Absent ({statusCount.Absent})
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
