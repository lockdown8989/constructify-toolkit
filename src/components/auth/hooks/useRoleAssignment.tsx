
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
      // First check if user already has the specific role we want to assign
      // This avoids recursion by querying for the exact role directly
      const dbRole = mapUIRoleToDBRole(userRole);
      console.log(`Checking if user ${userId} already has DB role ${dbRole}`);
      
      const { data: existingRole, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .eq('role', dbRole)
        .maybeSingle();
        
      if (roleCheckError) {
        console.error("Error checking existing role:", roleCheckError);
        toast({
          title: "Error",
          description: "Could not check user role: " + roleCheckError.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Only add the role if the user doesn't already have it
      if (!existingRole) {
        console.log(`Inserting new role ${dbRole} for user ${userId}`);
        const { error: insertError } = await supabase
          .from('user_roles')
          .insert({ 
            user_id: userId, 
            role: dbRole 
          });
            
        if (insertError) {
          console.error("Role insertion error:", insertError);
          toast({
            title: "Error",
            description: "Could not assign user role: " + insertError.message,
            variant: "destructive",
          });
          return false;
        }
        
        console.log(`Role ${dbRole} inserted successfully`);
      } else {
        console.log(`User already has role: ${dbRole}, not adding again`);
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
