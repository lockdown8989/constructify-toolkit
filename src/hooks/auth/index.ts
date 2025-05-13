
// Create a new index file to re-export auth hooks with proper typing

export { AuthProvider, useAuth } from './AuthProvider';
export { useAuthActions } from './useAuthActions';
export { useAuthPage } from './useAuthPage';
export { useRoles } from './useRoles';
export { isAuthenticated } from './types';
export type { UserRole } from './types';
