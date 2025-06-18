
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useManagerValidator } from './useManagerValidator';
import { useManagerNotifier } from './useManagerNotifier';
import { UserRole } from '../useUserRole';

export const useEmployeeUpdater = () => {
  const { toast } = useToast();
  const { validateManagerId } = useManagerValidator();
  const { notifyManager } = useManagerNotifier();

  const updateEmployeeRecord = async (
    userId: string, 
    userRole: UserRole, 
    newManagerId: string | null,
    currentManagerId: string | null
  ) => {
    // Only update if manager ID is provided and different from current
    if (newManagerId && currentManagerId !== newManagerId) {
      if (userRole === 'manager') {
        return await updateEmployerRecord(userId, newManagerId);
      } else if (userRole === 'employee' && newManagerId) {
        return await updateEmployeeManagerId(userId, newManagerId);
      }
    }
    
    return true; // No update needed
  };
  
  const updateEmployerRecord = async (userId: string, managerId: string) => {
    // Update existing employer record with manager ID
    console.log(`Updating employer record with manager ID: ${managerId}`);
    const { error } = await supabase
      .from('employees')
      .update({ 
        manager_id: managerId,
        job_title: 'Manager',
        status: 'Active',  // Use the correct status value
        lifecycle: 'Active'  // Use the correct lifecycle value
      })
      .eq('user_id', userId);
      
    if (error) {
      console.error("Error updating employee record:", error);
      toast({
        title: "Warning",
        description: "Account role updated but failed to update employee record: " + error.message,
        variant: "default",
      });
      return false;
    }
    
    return true;
  };
  
  const updateEmployeeManagerId = async (userId: string, managerId: string) => {
    // Verify the manager ID exists before updating
    const managerInfo = await validateManagerId(managerId);
      
    if (managerInfo) {
      // Update with valid manager ID
      console.log(`Updating employee record with valid manager ID: ${managerId}, manager: ${managerInfo.name}`);
      const { error } = await supabase
        .from('employees')
        .update({ 
          manager_id: managerId,
          status: 'Active',  // Use the correct status value
          lifecycle: 'Active'  // Use the correct lifecycle value
        })
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error updating employee with manager ID:", error);
        toast({
          title: "Warning",
          description: "Account created but failed to link to manager: " + error.message,
          variant: "default",
        });
        return false;
      }
      
      // Notify manager about connection
      await notifyManager(managerInfo, toast);
      
      return true;
    } else {
      console.log(`Warning: Manager ID ${managerId} not found during update`);
      toast({
        title: "Warning",
        description: "The manager ID you entered could not be verified. You can update it later.",
        variant: "default",
      });
      
      // Still update with unverified manager ID
      const { error } = await supabase
        .from('employees')
        .update({ 
          manager_id: managerId,
          status: 'Active',  // Use the correct status value
          lifecycle: 'Active'  // Use the correct lifecycle value
        })
        .eq('user_id', userId);
      
      if (error) {
        console.error("Error updating employee with unverified manager ID:", error);
        return false;
      }
      
      return true;
    }
  };

  return { updateEmployeeRecord };
};
