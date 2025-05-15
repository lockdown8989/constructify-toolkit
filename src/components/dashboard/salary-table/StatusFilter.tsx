
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

export interface StatusFilterProps {
  currentStatus: 'All' | 'Paid' | 'Absent' | 'Pending';
  onStatusChange: (status: 'All' | 'Paid' | 'Absent' | 'Pending') => void;
  statusCount: {
    All: number;
    Paid: number;
    Pending: number;
    Absent: number;
  };
  activeFilter?: string;
  onFilterChange?: (filter: string) => void;
}

export const StatusFilter: React.FC<StatusFilterProps> = ({
  currentStatus,
  onStatusChange,
  statusCount,
  activeFilter,
  onFilterChange
}) => {
  // Handle both interfaces
  const handleFilterChange = (status: 'All' | 'Paid' | 'Absent' | 'Pending') => {
    if (onStatusChange) onStatusChange(status);
    if (onFilterChange) onFilterChange(status.toLowerCase());
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Filter className="h-4 w-4" />
          <span>Status: {activeFilter ? activeFilter.charAt(0).toUpperCase() + activeFilter.slice(1) : currentStatus}</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleFilterChange('All')}>
          All ({statusCount.All})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleFilterChange('Paid')}>
          Paid ({statusCount.Paid})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleFilterChange('Pending')}>
          Pending ({statusCount.Pending})
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleFilterChange('Absent')}>
          Absent ({statusCount.Absent})
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
