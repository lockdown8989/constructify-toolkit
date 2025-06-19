
// This file now just re-exports from the auth folder
// to maintain backward compatibility with existing imports
export { 
  AuthProvider, 
  useAuth,
  type UserRole 
} from './auth';

// Create a simple function to check authentication status
export const isAuthenticated = () => {
  // This is a compatibility function - prefer using useAuth().isAuthenticated in components
  try {
    const { isAuthenticated } = useAuth();
    return isAuthenticated;
  } catch {
    // If called outside of AuthProvider context, return false
    return false;
  }
};
