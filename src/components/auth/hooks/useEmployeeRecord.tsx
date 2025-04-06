
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
        .select('id, manager_id')
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
        console.log(`Creating new employee record with role: ${userRole}, manager ID: ${managerId || 'none'}`);
        
        let managerIdToUse = null;
        let managerName = null;
        
        // If this is an employee with a manager ID, use that manager ID and validate it
        if (userRole === 'employee' && managerId) {
          console.log(`Employee registering with manager ID: ${managerId}`);
          
          // Verify the manager ID exists
          const { data: managerExists } = await supabase
            .from('employees')
            .select('id, user_id, name')
            .eq('manager_id', managerId)
            .eq('job_title', 'Manager')
            .maybeSingle();
            
          if (managerExists) {
            console.log(`Found valid manager with ID: ${managerId}, name: ${managerExists.name}`);
            managerIdToUse = managerId;
            managerName = managerExists.name;
            
            // Notify manager about new employee registration
            if (managerExists.user_id) {
              try {
                // Create notification in the future when notification system is implemented
                console.log(`Should notify manager ${managerExists.user_id} about new employee registration`);
                
                toast({
                  title: "Connected to manager",
                  description: `You've been connected to manager: ${managerExists.name}`,
                });
              } catch (notifyError) {
                console.error("Failed to notify manager:", notifyError);
              }
            }
          } else {
            // Invalid manager ID, but still create the employee record
            console.log(`Warning: Manager ID ${managerId} not found, but creating employee record anyway`);
            managerIdToUse = managerId; // Still store it for later validation
            toast({
              title: "Warning",
              description: "The manager ID you entered could not be verified. You can update it later in your profile.",
              variant: "default",
            });
          }
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
          
          // Show success message with manager connection if applicable
          if (userRole === 'employee' && managerName) {
            toast({
              title: "Account created",
              description: `Your account has been connected to manager: ${managerName}`,
            });
          }
        }
      } else {
        // Employee record already exists, update it if necessary
        console.log(`Updating existing employee record for role: ${userRole}`);
        
        // Only update manager ID if it's provided and different from current
        if (managerId && existingEmployee[0].manager_id !== managerId) {
          if (userRole === 'employer') {
            // Update existing employer record with manager ID
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
            // Verify the manager ID exists before updating
            const { data: managerExists } = await supabase
              .from('employees')
              .select('id, user_id, name')
              .eq('manager_id', managerId)
              .eq('job_title', 'Manager')
              .maybeSingle();
              
            if (managerExists) {
              // Update existing employee record with manager ID
              console.log(`Updating employee record with valid manager ID: ${managerId}, manager: ${managerExists.name}`);
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
              
              // Notify the manager about new connection
              if (managerExists.user_id) {
                try {
                  // Create notification in the future when notification system is implemented
                  console.log(`Should notify manager ${managerExists.user_id} about employee connection`);
                  
                  toast({
                    title: "Connected to manager",
                    description: `You've been connected to manager: ${managerExists.name}`,
                  });
                } catch (notifyError) {
                  console.error("Failed to notify manager:", notifyError);
                }
              }
            } else {
              console.log(`Warning: Manager ID ${managerId} not found during update`);
              toast({
                title: "Warning",
                description: "The manager ID you entered could not be verified. You can update it later.",
                variant: "default",
              });
              
              // Still update the manager ID for potential future validation
              const { error: updateError } = await supabase
                .from('employees')
                .update({ 
                  manager_id: managerId 
                })
                .eq('user_id', userId);
              
              if (updateError) {
                console.error("Error updating employee with unverified manager ID:", updateError);
              }
            }
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
