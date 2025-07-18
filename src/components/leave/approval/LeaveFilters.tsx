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
import { useIsMobile } from "@/hooks/use-mobile";

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
  const isMobile = useIsMobile();

  return (
    <div className={`flex flex-wrap gap-2 ${isMobile ? 'pt-2' : 'pt-4'}`}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size={isMobile ? "sm" : "sm"}
            className={isMobile ? "text-xs" : ""}
          >
            <Filter className={`mr-2 ${isMobile ? 'h-3 w-3' : 'h-4 w-4'}`} />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          className={`${isMobile ? 'w-64' : 'w-56'} z-50 bg-background`}
          side={isMobile ? "bottom" : "bottom"}
          align={isMobile ? "start" : "start"}
        >
          <DropdownMenuLabel className={isMobile ? "text-xs" : ""}>
            Filter by Employee
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={selectedEmployee} onValueChange={setSelectedEmployee}>
            <DropdownMenuRadioItem value="all" className={isMobile ? "text-xs" : ""}>
              All Employees
            </DropdownMenuRadioItem>
            {employees.map((employee) => (
              <DropdownMenuRadioItem 
                key={employee.id} 
                value={employee.id}
                className={isMobile ? "text-xs" : ""}
              >
                {employee.name}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className={isMobile ? "text-xs" : ""}>
            Filter by Department
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <DropdownMenuRadioItem value="all" className={isMobile ? "text-xs" : ""}>
              All Departments
            </DropdownMenuRadioItem>
            {departments.map((department) => (
              <DropdownMenuRadioItem 
                key={department} 
                value={department}
                className={isMobile ? "text-xs" : ""}
              >
                {department}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
          
          <DropdownMenuSeparator />
          <DropdownMenuLabel className={isMobile ? "text-xs" : ""}>
            Filter by Type
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuRadioGroup value={selectedType} onValueChange={setSelectedType}>
            <DropdownMenuRadioItem value="all" className={isMobile ? "text-xs" : ""}>
              All Types
            </DropdownMenuRadioItem>
            {leaveTypes.map((type) => (
              <DropdownMenuRadioItem 
                key={type} 
                value={type}
                className={isMobile ? "text-xs" : ""}
              >
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