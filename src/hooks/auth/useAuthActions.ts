
import { useSignIn } from './actions/useSignIn';
import { useSignUp } from './actions/useSignUp';
import { usePasswordReset } from './actions/usePasswordReset';
import { useSignOut } from './actions/useSignOut';

/**
 * Combined hook that provides all authentication actions
 */
export const useAuthActions = () => {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { resetPassword, updatePassword } = usePasswordReset();
  const { signOut } = useSignOut();

  return {
    signIn,
    signUp,
    resetPassword,
    updatePassword,
    signOut
  };
};
