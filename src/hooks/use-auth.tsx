
// This file now just re-exports from the auth folder
// to maintain backward compatibility with existing imports
export { 
  AuthProvider, 
  useAuth, 
  type UserRole 
} from './auth';

// Compatibility function for isAuthenticated
export const isAuthenticated = () => {
  // This is a compatibility function that should be used sparingly
  // Prefer checking auth.isAuthenticated directly in components
  if (typeof window === 'undefined') return false;
  
  try {
    // Check if there's a session in localStorage as a fallback
    const session = localStorage.getItem('sb-auth-token');
    return !!session;
  } catch {
    return false;
  }
};
