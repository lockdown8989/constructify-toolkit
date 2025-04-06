import { useEmployeeCreator } from './useEmployeeCreator';
import { useEmployeeUpdater } from './useEmployeeUpdater';
import { useManagerNotifier } from './useManagerNotifier';
import { UserRole } from '../useUserRole';
import { supabase } from "@/integrations/supabase/client";

export const useEmployeeRecord = () => {
  const { createEmployeeRecord } = useEmployeeCreator();
  const { updateEmployeeRecord } = useEmployeeUpdater();
  const { notifyManager } = useManagerNotifier();

  const createOrUpdateEmployeeRecord = async (
    userId: string, 
    fullName: string, 
    userRole: UserRole, 
    managerId: string | null
  ) => {
    try {
      console.log(`Creating/updating employee record for ${fullName} with role ${userRole} and manager ID ${managerId || 'none'}`);
      
      // Check if user already has an employee record
      const existingEmployee = await checkExistingEmployee(userId);
      
      // If no existing record, create a new one
      if (!existingEmployee) {
        return await createEmployeeRecord(userId, fullName, userRole, managerId);
      } 
      // Otherwise, update the existing record
      else {
        return await updateEmployeeRecord(userId, userRole, managerId, existingEmployee.manager_id);
      }
    } catch (error) {
      console.error("Employee record operation error:", error);
      return false;
    }
  };

  const checkExistingEmployee = async (userId: string) => {
    const { data: existingEmployee, error: employeeCheckError } = await supabase
      .from('employees')
      .select('id, manager_id')
      .eq('user_id', userId)
      .maybeSingle();
      
    if (employeeCheckError) {
      console.error("Error checking existing employee:", employeeCheckError);
      return null;
    }
    
    return existingEmployee;
  };

  return { createOrUpdateEmployeeRecord };
};
