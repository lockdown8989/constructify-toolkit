
// This file now just re-exports from the enhanced auth system
// to maintain backward compatibility with existing imports
export { 
  AuthProvider, 
  useAuth, 
  isAuthenticated,
  type UserRole,
  type AuthContextType
} from './auth/AuthProvider';
export { mapUIRoleToDBRole } from './auth/types';
