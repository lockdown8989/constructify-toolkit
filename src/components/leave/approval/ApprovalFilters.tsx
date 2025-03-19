
import React from "react";
import { Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Employee } from "@/hooks/use-employees";

interface ApprovalFiltersProps {
  employees: Employee[];
  departments: string[];
  leaveTypes: string[];
  selectedEmployee: string;
  selectedDepartment: string;
  selectedType: string;
  onEmployeeChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onTypeChange: (value: string) => void;
}

const ApprovalFilters: React.FC<ApprovalFiltersProps> = ({
  employees,
  departments,
  leaveTypes,
  selectedEmployee,
  selectedDepartment,
  selectedType,
  onEmployeeChange,
  onDepartmentChange,
  onTypeChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2 pt-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          <DropdownMenuLabel>Filter by Employee</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={selectedEmployee} onValueChange={onEmployeeChange}>
            <DropdownMenuRadioItem value="all">All Employees</DropdownMenuRadioItem>
            {employees.map((employee) => (
              <DropdownMenuRadioItem key={employee.id} value={employee.id}>
                {employee.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Department</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={selectedDepartment} onValueChange={onDepartmentChange}>
            <DropdownMenuRadioItem value="all">All Departments</DropdownMenuRadioItem>
            {departments.map((department) => (
              <DropdownMenuRadioItem key={department} value={department}>
                {department}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Filter by Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={selectedType} onValueChange={onTypeChange}>
            <DropdownMenuRadioItem value="all">All Types</DropdownMenuRadioItem>
            {leaveTypes.map((type) => (
              <DropdownMenuRadioItem key={type} value={type}>
                {type}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ApprovalFilters;
