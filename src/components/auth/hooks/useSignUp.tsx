
import { useToast } from "@/hooks/use-toast";
import { useSignUpForm } from "./useSignUpForm";
import { useUserRole } from "./useUserRole";
import { useEmployeeRecord } from "./useEmployeeRecord";
import { useRoleAssignment } from "./useRoleAssignment";
import { useSignUpValidation } from "./useSignUpValidation";
import { useSignUpSubmit } from "./useSignUpSubmit";

type UseSignUpProps = {
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
}

export const useSignUp = ({ onSignUp }: UseSignUpProps) => {
  // Compose the hooks
  const formState = useSignUpForm();
  const roleManager = useUserRole();
  const employeeManager = useEmployeeRecord();
  const roleAssigner = useRoleAssignment();
  
  // Use the validation hook
  const validation = useSignUpValidation(roleManager.userRole, roleManager.managerId);
  
  // Use the submit hook
  const { signUpError, handleSubmit } = useSignUpSubmit({
    onSignUp,
    email: formState.email,
    password: formState.password,
    firstName: formState.firstName,
    lastName: formState.lastName,
    setIsLoading: formState.setIsLoading,
    userRole: roleManager.userRole,
    managerId: roleManager.managerId,
    assignUserRole: roleAssigner.assignUserRole,
    createOrUpdateEmployeeRecord: employeeManager.createOrUpdateEmployeeRecord,
    getFullName: formState.getFullName
  });

  return {
    ...formState,
    ...roleManager,
    ...validation,
    signUpError,
    handleSubmit
  };
};
