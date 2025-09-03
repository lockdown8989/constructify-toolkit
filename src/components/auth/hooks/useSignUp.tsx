
import { useSignUpForm } from "./useSignUpForm";
import { useUserRole } from "./useUserRole";
import { useServerSignUp } from "./useServerSignUp";

type UseSignUpProps = {
  onSignUp: (email: string, password: string, firstName: string, lastName: string) => Promise<any>;
}

export const useSignUp = ({ onSignUp }: UseSignUpProps) => {
  // Compose the hooks
  const formState = useSignUpForm();
  const roleManager = useUserRole();
  const serverSignUp = useServerSignUp({ onSignUp });
  
  // Create consolidated submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formState.validateForm()) {
      serverSignUp.setSignUpError("Please fill in all required fields");
      return;
    }
    
    await serverSignUp.handleSubmit(
      formState.email,
      formState.password,
      formState.firstName,
      formState.lastName,
      roleManager.userRole,
      roleManager.managerId
    );
  };

  return {
    ...formState,
    ...roleManager,
    signUpError: serverSignUp.signUpError,
    isLoading: serverSignUp.isLoading,
    handleSubmit,
    // Add empty validation state for backward compatibility
    isValidatingManagerId: false,
    isManagerIdValid: true,
    managerName: null
  };
};
