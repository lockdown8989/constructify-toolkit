
import { useSignInAction } from "./actions/useSignInAction";
import { useSignUpAction } from "./actions/useSignUpAction";
import { usePasswordActions } from "./actions/usePasswordActions";
import { useSignOutAction } from "./actions/useSignOutAction";

/**
 * Main hook that combines all authentication-related actions
 */
export const useAuthActions = () => {
  const { signIn } = useSignInAction();
  const { signUp } = useSignUpAction();
  const { resetPassword, updatePassword } = usePasswordActions();
  const { signOut } = useSignOutAction();

  return {
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut
  };
};
