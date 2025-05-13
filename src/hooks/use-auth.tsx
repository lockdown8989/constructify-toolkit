
// Re-export auth hooks from the new implementation
export * from './auth';

// Add specific exports for backward compatibility
export { AuthProvider } from './auth/AuthProvider';
export { useAuthActions } from './auth/useAuthActions';

// Export missing auth methods needed by ResetPasswordForm and UpdatePasswordForm
import { useAuth as useBaseAuth } from './auth';
import { useAuthActions } from './auth/useAuthActions';

export function useAuth() {
  const auth = useBaseAuth();
  const { resetPassword, updatePassword, signIn, signUp } = useAuthActions();
  
  return {
    ...auth,
    resetPassword,
    updatePassword,
    signIn,
    signUp
  };
}
