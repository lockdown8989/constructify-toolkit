
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "./useUserRole";

// Map UI role names to database role names
const mapUIRoleToDBRole = (uiRole: UserRole): string => {
  switch (uiRole) {
    case 'manager': return 'employer';
    case 'admin': return 'admin';
    case 'hr': return 'hr';
    case 'employee': 
    default: return 'employee';
  }
};

export const useRoleAssignment = () => {
  const { toast } = useToast();

  const assignUserRole = async (userId: string, userRole: UserRole) => {
    try {
      // Convert UI role to DB role
      const dbRole = mapUIRoleToDBRole(userRole);
      console.log(`Assigning DB role ${dbRole} to user ${userId}`);
      
      // Check if user already has this specific role using a direct query
      // This avoids infinite recursion by not using RLS policies
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', dbRole)
        .maybeSingle();
        
      if (roleCheckError) {
        console.error("Error checking existing role:", roleCheckError);
        return false;
      }
      
      // Only add role if user doesn't already have it
      if (!existingRole) {
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: userId, 
            role: dbRole 
          });
            
        if (insertError) {
          console.error("Role insertion error:", insertError);
          return false;
        }
        
        console.log(`Role ${dbRole} assigned successfully`);
      } else {
        console.log(`User already has role ${dbRole}`);
      }
      
      return true;
    } catch (error) {
      console.error("Role assignment error:", error);
      return false;
    }
  };

  return { assignUserRole, mapUIRoleToDBRole };
};

export { mapUIRoleToDBRole };
