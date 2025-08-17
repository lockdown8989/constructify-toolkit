import { supabase } from "@/integrations/supabase/client";

export const useEmployeeValidator = () => {
  // Ensure user has only one role (highest priority)
  const ensureSingleRole = async (userId: string) => {
    try {
      console.log(`🔍 Ensuring single role for user ${userId}`);
      
      // Get all roles for this user
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });
        
      if (error) {
        console.error("Error fetching user roles:", error);
        return false;
      }
      
      // If user has multiple roles, keep only the highest priority one
      if (roles && roles.length > 1) {
        console.log(`👤 User has ${roles.length} roles, cleaning up...`);
        
        // Define role priority (lower number = higher priority)
        const rolePriority: Record<string, number> = {
          'admin': 1,
          'hr': 2,
          'employer': 3, // This is "manager" in UI
          'payroll': 4,
          'employee': 5
        };
        
        // Find the highest priority role
        const highestPriorityRole = roles.reduce((highest, current) => {
          const currentPriority = rolePriority[current.role] || 10;
          const highestPriority = rolePriority[highest.role] || 10;
          return currentPriority < highestPriority ? current : highest;
        });
        
        console.log(`🎯 Keeping highest priority role: ${highestPriorityRole.role}`);
        
        // Remove all roles
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId);
          
        // Insert only the highest priority role
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({
            user_id: userId,
            role: highestPriorityRole.role
          });
          
        if (insertError) {
          console.error("Error inserting single role:", insertError);
          return false;
        }
        
        console.log(`✅ User ${userId} now has single role: ${highestPriorityRole.role}`);
      }
      
      return true;
    } catch (error) {
      console.error("Error ensuring single role:", error);
      return false;
    }
  };
  
  // Validate manager connection for employees and payroll users
  const validateManagerConnection = async (employeeUserId: string, managerId: string) => {
    try {
      console.log(`🔗 Validating manager connection: ${managerId} for user ${employeeUserId}`);
      
      // Use the database function to validate manager ID
      const { data: validationResult, error } = await supabase.rpc('validate_manager_id_strict', {
        p_manager_id: managerId
      });
      
      if (error) {
        console.error("Manager validation error:", error);
        return { valid: false, error: "Unable to validate manager ID" };
      }
      
      if (!validationResult?.valid) {
        console.log(`❌ Manager ID ${managerId} validation failed: ${validationResult?.error}`);
        return { valid: false, error: validationResult?.error || "Invalid manager ID" };
      }
      
      console.log(`✅ Manager ID ${managerId} validated successfully`);
      return { 
        valid: true, 
        managerData: {
          name: validationResult.manager_name,
          userId: validationResult.manager_user_id,
          role: validationResult.manager_role
        }
      };
    } catch (error) {
      console.error("Manager connection validation error:", error);
      return { valid: false, error: "Connection validation failed" };
    }
  };

  return { 
    ensureSingleRole,
    validateManagerConnection
  };
};
