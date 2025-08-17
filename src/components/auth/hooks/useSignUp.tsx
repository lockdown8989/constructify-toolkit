
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useSignUpForm } from "./useSignUpForm";
import { useUserRole } from "./useUserRole";
import { useEmployeeRecord } from "./employee-record";
import { useRoleAssignment } from "./useRoleAssignment";
import { useSignUpValidation } from "./useSignUpValidation";
import { useSignUpSubmit } from "./useSignUpSubmit";
import { useEmployeeValidator } from "./employee-record/useEmployeeValidator";
import { UserRole } from "./useUserRole";

type UseSignUpProps = {
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
}

export const useSignUp = ({ onSignUp }: UseSignUpProps) => {
  // Compose the hooks
  const formState = useSignUpForm();
  const roleManager = useUserRole();
  const employeeManager = useEmployeeRecord();
  const roleAssigner = useRoleAssignment();
  const { ensureSingleRole } = useEmployeeValidator();
  
  // Enhanced assign user role that ensures single role
  const assignUserRoleSingle = async (userId: string, userRole: UserRole) => {
    const roleAssigned = await roleAssigner.assignUserRole(userId, userRole);
    if (roleAssigned) {
      // Ensure user has only one role
      await ensureSingleRole(userId);
    }
    return roleAssigned;
  };
  
  // Use the validation hook
  const validation = useSignUpValidation(roleManager.userRole, roleManager.managerId);
  
  // Use the submit hook without rate limiting
  const { signUpError, handleSubmit, clearSignUpError } = useSignUpSubmit({
    onSignUp,
    email: formState.email,
    password: formState.password,
    firstName: formState.firstName,
    lastName: formState.lastName,
    setIsLoading: formState.setIsLoading,
    userRole: roleManager.userRole,
    managerId: roleManager.managerId,
    assignUserRole: assignUserRoleSingle,
    createOrUpdateEmployeeRecord: employeeManager.createOrUpdateEmployeeRecord,
    getFullName: formState.getFullName,
    validateForm: formState.validateForm
  });

  // Clear error when password becomes valid
  const isPasswordValid = formState.password.length >= 8 && 
    /[A-Z]/.test(formState.password) && 
    /[a-z]/.test(formState.password) && 
    /\d/.test(formState.password) && 
    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formState.password);

  React.useEffect(() => {
    if (isPasswordValid && signUpError && (signUpError.toLowerCase().includes('password') || signUpError.toLowerCase().includes('weak'))) {
      clearSignUpError();
    }
  }, [isPasswordValid, signUpError, clearSignUpError]);

  return {
    ...formState,
    ...roleManager,
    ...validation,
    signUpError,
    handleSubmit
  };
};
