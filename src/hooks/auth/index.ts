
// Create a new index file to re-export auth hooks with proper typing

export { AuthProvider, useAuth } from './AuthProvider';
export { useAuthActions } from './useAuthActions';
export { useAuthPage } from './useAuthPage';
export { useRoles } from './useRoles';

// Export from types
export type { UserRole, AuthContextType } from './types';

// Add this function to fix the missing export
export const isAuthenticated = (user: any): boolean => {
  return !!user;
};
