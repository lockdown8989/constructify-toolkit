
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

interface LeaveFiltersProps {
  employees: any[];
  departments: string[];
  leaveTypes: string[];
  selectedEmployee: string;
  selectedDepartment: string;
  selectedType: string;
  setSelectedEmployee: (value: string) => void;
  setSelectedDepartment: (value: string) => void;
  setSelectedType: (value: string) => void;
}

const LeaveFilters: React.FC<LeaveFiltersProps> = ({
  employees,
  departments,
  leaveTypes,
  selectedEmployee,
  selectedDepartment,
  selectedType,
  setSelectedEmployee,
  setSelectedDepartment,
  setSelectedType,
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
          <DropdownMenuRadioGroup value={selectedEmployee} onValueChange={setSelectedEmployee}>
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
          <DropdownMenuRadioGroup value={selectedDepartment} onValueChange={setSelectedDepartment}>
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
          <DropdownMenuRadioGroup value={selectedType} onValueChange={setSelectedType}>
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

export default LeaveFilters;
