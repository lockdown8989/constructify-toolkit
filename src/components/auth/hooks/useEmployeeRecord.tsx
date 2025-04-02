
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "./useUserRole";

export const useEmployeeRecord = () => {
  const { toast } = useToast();

  const createOrUpdateEmployeeRecord = async (
    userId: string, 
    fullName: string, 
    userRole: UserRole, 
    managerId: string | null
  ) => {
    try {
      // First check if user already has an employee record
      const { data: existingEmployee, error: employeeCheckError } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userId);
        
      if (employeeCheckError) {
        console.error("Error checking existing employee:", employeeCheckError);
        toast({
          title: "Error",
          description: "Could not check existing employee record: " + employeeCheckError.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Create or update employee record based on whether it exists
      if (!existingEmployee || existingEmployee.length === 0) {
        // No existing record, create a new one
        const managerIdToSave = userRole === 'employer' ? managerId : null;
        
        // Only create employee record if the role is employee or employer
        if (userRole === 'employee' || userRole === 'employer') {
          const { error: employeeError } = await supabase
            .from('employees')
            .insert({
              name: fullName,
              job_title: userRole === 'employer' ? 'Manager' : 'Employee',
              department: 'General',
              site: 'Main Office',
              salary: 0, // Default salary, to be updated later
              start_date: new Date().toISOString().split('T')[0],
              status: 'Active',
              lifecycle: 'Employed',
              manager_id: managerIdToSave,
              user_id: userId // Link the employee record to the user account
            });
            
          if (employeeError) {
            console.error("Error creating employee record:", employeeError);
            toast({
              title: "Warning",
              description: "Account created but failed to create employee record: " + employeeError.message,
              variant: "default",
            });
            return false;
          }
        }
      } else {
        // Employee record already exists, update it if necessary
        if (userRole === 'employer' && managerId) {
          // Update existing employee to set manager_id
          const { error: updateError } = await supabase
            .from('employees')
            .update({ 
              manager_id: managerId,
              job_title: 'Manager'
            })
            .eq('user_id', userId);
            
          if (updateError) {
            console.error("Error updating employee record:", updateError);
            toast({
              title: "Warning",
              description: "Account role updated but failed to update employee record: " + updateError.message,
              variant: "default",
            });
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      console.error("Employee record operation error:", error);
      return false;
    }
  };

  return { createOrUpdateEmployeeRecord };
};
