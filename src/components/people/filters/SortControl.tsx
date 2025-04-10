
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Employee } from '@/hooks/use-employees';

interface SortControlProps {
  sortField: keyof Employee;
  sortDirection: 'asc' | 'desc';
  setSortField: (field: keyof Employee) => void;
  setSortDirection: (direction: 'asc' | 'desc') => void;
}

const SortControl: React.FC<SortControlProps> = ({
  sortField,
  sortDirection,
  setSortField,
  setSortDirection,
}) => {
  return (
    <div className="flex items-center gap-2 ml-auto">
      <span className="text-sm text-gray-500">Sort by:</span>
      <Select 
        value={sortField} 
        onValueChange={(value) => setSortField(value as keyof Employee)}
      >
        <SelectTrigger className="h-9 min-w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="name">Name</SelectItem>
          <SelectItem value="job_title">Job Title</SelectItem>
          <SelectItem value="department">Department</SelectItem>
          <SelectItem value="site">Site</SelectItem>
          <SelectItem value="salary">Salary</SelectItem>
          <SelectItem value="start_date">Start Date</SelectItem>
        </SelectContent>
      </Select>
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-9 w-9"
        onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
      >
        {sortDirection === 'asc' ? '↑' : '↓'}
      </Button>
    </div>
  );
};

export default SortControl;
