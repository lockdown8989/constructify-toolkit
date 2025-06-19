
import { useSecureAuth } from '@/hooks/security/useSecureAuth';
import { useAuthActions } from '@/hooks/auth/useAuthActions';

export const useSecureSignIn = () => {
  const { secureSignIn } = useSecureAuth();
  const { signIn: originalSignIn } = useAuthActions();

  const signIn = async (email: string, password: string) => {
    return await secureSignIn(email, password, originalSignIn);
  };

  return { signIn };
};
