
import { useSignIn } from './actions/useSignIn';
import { useSignUp } from './actions/useSignUp';
import { usePasswordReset } from './actions/usePasswordReset';
import { useSignOut } from './actions/useSignOut';
import { useDeleteAccount } from './actions/useDeleteAccount';

/**
 * Combined hook that provides all authentication actions
 */
export const useAuthActions = () => {
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const { resetPassword, updatePassword } = usePasswordReset();
  const { signOut } = useSignOut();
  const { deleteAccount } = useDeleteAccount();

  // Enhanced signUp wrapper that handles the complex signup flow
  const enhancedSignUp = async (email: string, password: string, firstName: string, lastName: string) => {
    const metadata = {
      first_name: firstName?.trim() || '',
      last_name: lastName?.trim() || '',
      full_name: `${firstName?.trim() || ''} ${lastName?.trim() || ''}`.trim()
    };

    const result = await signUp(email, password, metadata);
    
    // Check if email confirmation is required
    const requiresConfirmation = result.data?.user && !result.data.user.email_confirmed_at;
    
    return {
      ...result,
      requiresConfirmation
    };
  };

  return {
    signIn,
    signUp: enhancedSignUp,
    resetPassword,
    updatePassword,
    signOut,
    deleteAccount
  };
};
