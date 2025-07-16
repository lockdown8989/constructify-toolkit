// This file now just re-exports from the auth folder
// to maintain backward compatibility with existing imports
export { 
  AuthProvider, 
  useAuth, 
  isAuthenticated,
  type UserRole 
} from './auth/AuthProvider';