
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useManagerValidator } from './useManagerValidator';
import { useManagerNotifier } from './useManagerNotifier';
import { UserRole } from '../useUserRole';

export const useEmployeeCreator = () => {
  const { toast } = useToast();
  const { validateManagerId } = useManagerValidator();
  const { notifyManager } = useManagerNotifier();

  const createEmployeeRecord = async (
    userId: string, 
    fullName: string, 
    userRole: UserRole, 
    managerId: string | null
  ) => {
    console.log(`🎯 Creating new employee record with role: ${userRole}, manager ID: ${managerId || 'none'}`);
    
    let managerIdToUse = null;
    let managerName = null;
    
    // If employee with manager ID, validate it
    if (userRole === 'employee' && managerId) {
      const managerInfo = await validateManagerId(managerId);
      
      if (managerInfo) {
        managerIdToUse = managerId;
        managerName = managerInfo.name;
        
        // Notify manager about new employee
        await notifyManager(managerInfo, toast);
      } else {
        // Still store unverified manager ID for later validation
        managerIdToUse = managerId;
        toast({
          title: "Warning",
          description: "The manager ID you entered could not be verified. You can update it later in your profile.",
          variant: "default",
        });
      }
    }
    
    // If this is a manager, use their own manager ID
    if (userRole === 'manager') {
      console.log(`🎯 Manager registering with manager ID: ${managerId}`);
      managerIdToUse = managerId;
    }
    
    // Create record based on role
    if (userRole === 'employee' || userRole === 'manager') {
      const result = await insertEmployeeRecord(userId, fullName, userRole, managerIdToUse);
      
      if (!result) {
        return false;
      }
      
      // Show success message for employee with manager connection
      if (userRole === 'employee' && managerName) {
        toast({
          title: "Account created",
          description: `Your account has been connected to manager: ${managerName}`,
        });
      } else if (userRole === 'manager') {
        toast({
          title: "Manager Account Created",
          description: `Manager account created successfully. Your Manager ID is ${managerId}`,
        });
      }
      
      return true;
    }
    
    return false;
  };
  
  const insertEmployeeRecord = async (
    userId: string,
    fullName: string,
    userRole: UserRole,
    managerId: string | null
  ) => {
    const jobTitle = userRole === 'manager' ? 'Manager' : 'Employee';
    const employeeRole = userRole === 'manager' ? 'employer' : 'employee'; // Map to database role
    
    console.log(`🎯 Creating record with job title: ${jobTitle}, role: ${employeeRole}, and manager ID: ${managerId || 'none'}`);
    
    try {
      // First check if there's already an employee record for this user
      const { data: existing } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();
        
      if (existing) {
        console.log("Employee record already exists, updating instead of creating");
        const { error: updateError } = await supabase
          .from('employees')
          .update({
            name: fullName,
            job_title: jobTitle,
            role: employeeRole,
            manager_id: managerId
          })
          .eq('user_id', userId);
          
        if (updateError) {
          console.error("Error updating employee record:", updateError);
          toast({
            title: "Warning",
            description: "Account created but failed to update employee record: " + updateError.message,
            variant: "default",
          });
          return false;
        }
        return true;
      }
      
      // Create new employee record
      const { error } = await supabase
        .from('employees')
        .insert({
          name: fullName,
          job_title: jobTitle,
          department: userRole === 'manager' ? 'Management' : 'General',
          site: 'Main Office',
          salary: userRole === 'manager' ? 55000 : 35000, // Different salary for managers
          start_date: new Date().toISOString().split('T')[0],
          status: 'Active',
          lifecycle: 'Active',
          role: employeeRole,
          manager_id: managerId,
          user_id: userId // Link the employee record to the user account
        });
        
      if (error) {
        console.error("Error creating employee record:", error);
        toast({
          title: "Warning",
          description: "Account created but failed to create employee record: " + error.message,
          variant: "default",
        });
        return false;
      }
      
      console.log(`✅ Employee record created successfully for ${userRole}`);
      return true;
    } catch (error) {
      console.error("Error in insertEmployeeRecord:", error);
      return false;
    }
  };

  return { createEmployeeRecord };
};
