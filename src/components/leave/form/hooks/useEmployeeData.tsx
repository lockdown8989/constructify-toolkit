
import { useAuth } from "@/hooks/use-auth";
import { useEmployees } from "@/hooks/use-employees";
import { useProjectsForDepartment } from "@/hooks/use-projects";

/**
 * Hook to fetch and prepare employee data required for leave requests
 */
export const useEmployeeData = () => {
  // Get the current authenticated user
  const { user } = useAuth();
  
  // Get employees data to find the current employee record
  const { data: employees = [], isLoading: isLoadingEmployees } = useEmployees();
  
  // Get current employee ID and department from employees list based on user ID
  const currentEmployee = user 
    ? employees.find(emp => emp.user_id === user.id) 
    : undefined;
  
  const employeeId = currentEmployee?.id || "";
  const employeeDepartment = currentEmployee?.department || "";
  
  // Get projects for the employee's department
  const { data: departmentProjects = [] } = useProjectsForDepartment(employeeDepartment);
  
  return {
    user,
    currentEmployee,
    employeeId,
    employeeDepartment,
    departmentProjects,
    isLoadingEmployees
  };
};
