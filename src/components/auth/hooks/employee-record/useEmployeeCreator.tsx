
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useManagerValidator } from './useManagerValidator';
import { useManagerNotifier } from './useManagerNotifier';
import { UserRole } from '../useUserRole';

export const useEmployeeCreator = () => {
  const { toast } = useToast();
  const { validateManagerId } = useManagerValidator();
  const { notifyManager } = useManagerNotifier();

  const generateManagerId = () => {
    const randomPart = Math.floor(10000 + Math.random() * 90000);
    return `MGR-${randomPart}`;
  };

  const createEmployeeRecord = async (
    userId: string, 
    fullName: string, 
    userRole: UserRole, 
    managerId: string | null
  ) => {
    try {
      let finalManagerId = managerId;
      
      // Auto-generate manager ID for managers
      if (userRole === 'manager' && !managerId) {
        finalManagerId = generateManagerId();
        console.log(`Generated manager ID for new manager: ${finalManagerId}`);
      }

      // For employees with manager ID, validate it first
      if (userRole === 'employee' && managerId) {
        const managerInfo = await validateManagerId(managerId);
        if (!managerInfo) {
          console.log(`Warning: Manager ID ${managerId} not found during creation`);
          toast({
            title: "Warning",
            description: "The manager ID you entered could not be verified. You can update it later.",
            variant: "default",
          });
        } else {
          console.log(`Validated manager ID: ${managerId}, manager: ${managerInfo.name}`);
          // Notify manager about new connection
          await notifyManager(managerInfo, toast);
        }
      }

      const employeeData = {
        name: fullName,
        job_title: userRole === 'manager' ? 'Manager' : 'Employee',
        department: userRole === 'manager' ? 'Management' : 'General',
        site: 'Main Office',
        manager_id: finalManagerId,
        status: 'Active',
        lifecycle: 'Active',
        salary: 0,
        user_id: userId
      };

      console.log(`Creating employee record:`, employeeData);
      
      const { error } = await supabase
        .from('employees')
        .insert(employeeData);
        
      if (error) {
        console.error("Error creating employee record:", error);
        toast({
          title: "Warning",
          description: "Account created but failed to create employee record: " + error.message,
          variant: "default",
        });
        return false;
      }
      
      // Show success message with manager ID for managers
      if (userRole === 'manager' && finalManagerId) {
        toast({
          title: "Success",
          description: `Manager account created! Your Manager ID is ${finalManagerId}. Share this with your employees.`,
          duration: 6000,
        });
      }
      
      return true;
    } catch (error) {
      console.error("Employee record creation error:", error);
      return false;
    }
  };

  return { createEmployeeRecord };
};
