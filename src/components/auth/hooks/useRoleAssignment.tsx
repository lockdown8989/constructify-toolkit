
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "./useUserRole";

export const useRoleAssignment = () => {
  const { toast } = useToast();

  const assignUserRole = async (userId: string, userRole: UserRole) => {
    try {
      // First check if user already has any roles
      const { data: existingRoles, error: roleCheckError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      if (roleCheckError) {
        console.error("Error checking existing roles:", roleCheckError);
        toast({
          title: "Error",
          description: "Could not check user roles: " + roleCheckError.message,
          variant: "destructive",
        });
        return false;
      }
      
      // Check specifically for the role we're trying to add
      const hasRequestedRole = existingRoles?.some(r => r.role === userRole);
      
      if (!hasRequestedRole) {
        // Make sure we're not trying to insert 'manager' as this is not a valid enum value
        const dbRole = userRole === "manager" ? "employer" : userRole;
        
        // Add the new role (without removing existing roles)
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
        console.log(`User already has role: ${userRole}, not adding again`);
      }
      
      return true;
    } catch (error) {
      console.error("Role assignment error:", error);
      return false;
    }
  };

  return { assignUserRole };
};
