
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
      console.log(`Creating/updating employee record for ${fullName} with role ${userRole} and manager ID ${managerId || 'none'}`);
      
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
        console.log(`Creating new employee record with role: ${userRole}`);
        
        let managerIdToUse = null;
        
        // If this is an employee with a manager ID, use that manager ID
        if (userRole === 'employee' && managerId) {
          console.log(`Employee registering with manager ID: ${managerId}`);
          managerIdToUse = managerId;
        }
        
        // If this is an employer/manager, use their own manager ID as reference
        if (userRole === 'employer') {
          console.log(`Employer/manager registering with manager ID: ${managerId}`);
          managerIdToUse = managerId;
        }
        
        // Create appropriate record based on role
        if (userRole === 'employee' || userRole === 'employer') {
          const jobTitle = userRole === 'employer' ? 'Manager' : 'Employee';
          console.log(`Creating record with job title: ${jobTitle} and manager ID: ${managerIdToUse || 'none'}`);
          
          const { error: employeeError } = await supabase
            .from('employees')
            .insert({
              name: fullName,
              job_title: jobTitle,
              department: 'General',
              site: 'Main Office',
              salary: 0, // Default salary, to be updated later
              start_date: new Date().toISOString().split('T')[0],
              status: 'Active',
              lifecycle: 'Employed',
              manager_id: managerIdToUse,
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
        console.log(`Updating existing employee record for role: ${userRole}`);
        
        if (userRole === 'employer' && managerId) {
          // Update existing employee to set manager_id
          console.log(`Updating employer record with manager ID: ${managerId}`);
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
        } else if (userRole === 'employee' && managerId) {
          // Update existing employee record with manager ID
          console.log(`Updating employee record with manager ID: ${managerId}`);
          const { error: updateError } = await supabase
            .from('employees')
            .update({ 
              manager_id: managerId 
            })
            .eq('user_id', userId);
            
          if (updateError) {
            console.error("Error updating employee with manager ID:", updateError);
            toast({
              title: "Warning",
              description: "Account created but failed to link to manager: " + updateError.message,
              variant: "default",
            });
            return false;
          }
        }
      }
      
      console.log(`Successfully created/updated employee record for ${fullName}`);
      return true;
    } catch (error) {
      console.error("Employee record operation error:", error);
      return false;
    }
  };

  return { createOrUpdateEmployeeRecord };
};
