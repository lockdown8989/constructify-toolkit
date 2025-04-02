
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useSignUpForm } from "./useSignUpForm";
import { useUserRole } from "./useUserRole";
import { useEmployeeRecord } from "./useEmployeeRecord";
import { useRoleAssignment } from "./useRoleAssignment";

type UseSignUpProps = {
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
}

export const useSignUp = ({ onSignUp }: UseSignUpProps) => {
  const { toast } = useToast();
  const formState = useSignUpForm();
  const roleManager = useUserRole();
  const employeeManager = useEmployeeRecord();
  const roleAssigner = useRoleAssignment();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    formState.setIsLoading(true);
    
    try {
      console.log(`Attempting to sign up with role: ${roleManager.userRole}`);
      
      // Call the sign up function provided via props
      const { error } = await onSignUp(
        formState.email, 
        formState.password, 
        formState.firstName, 
        formState.lastName
      );
      
      if (!error) {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log(`Got user with ID: ${user.id}, assigning role: ${roleManager.userRole}`);
          
          // Assign user role
          const roleSuccess = await roleAssigner.assignUserRole(user.id, roleManager.userRole);
          
          if (!roleSuccess) {
            formState.setIsLoading(false);
            return;
          }
          
          // Create or update employee record
          const employeeSuccess = await employeeManager.createOrUpdateEmployeeRecord(
            user.id,
            formState.getFullName(),
            roleManager.userRole,
            roleManager.userRole === 'employer' ? roleManager.managerId : null
          );
          
          // Show appropriate success message
          if (roleManager.userRole === 'employer') {
            toast({
              title: "Success",
              description: `Account created/updated with manager role. Your Manager ID is ${roleManager.managerId}. Share this with your employees.`,
            });
          } else {
            toast({
              title: "Success", 
              description: `Account created/updated with ${roleManager.userRole} role.`,
            });
          }
        }
      }
    } catch (error) {
      console.error("Sign up error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      formState.setIsLoading(false);
    }
  };

  return {
    ...formState,
    ...roleManager,
    handleSubmit
  };
};
