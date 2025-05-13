
// Export all auth-related hooks and components with proper typing
export { AuthProvider, useAuth } from './AuthProvider';
export { useAuthActions } from './useAuthActions';
export { useAuthPage } from './useAuthPage';
export { useRoles } from './useRoles';

// Export from types
export type { UserRole, AuthContextType } from './types';

// Add this function for backwards compatibility
export const isAuthenticated = (user: any): boolean => {
  return !!user;
};
