
import React, { useState } from "react";
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
import type { LeaveCalendar } from "@/hooks/use-leave-calendar";
import type { Employee } from "@/hooks/use-employees";

interface ApprovalFiltersProps {
  employees: Employee[];
  leaves: LeaveCalendar[];
}

const ApprovalFilters: React.FC<ApprovalFiltersProps> = ({ employees, leaves }) => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  
  // Get unique departments and leave types
  const departments = [...new Set(employees.map(emp => emp.department))];
  const leaveTypes = [...new Set(leaves.map(leave => leave.type))];
  
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
}

export default ApprovalFilters;
