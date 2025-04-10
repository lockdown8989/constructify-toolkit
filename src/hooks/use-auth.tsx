
// This file now just re-exports from the auth folder
// to maintain backward compatibility with existing imports
export { 
  AuthProvider, 
  useAuth 
} from './auth';

// Add a simple isAuthenticated function that always returns true for demo purposes
export const isAuthenticated = () => true;
