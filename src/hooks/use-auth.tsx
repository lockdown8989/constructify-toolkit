
// Create a centralized auth hook that combines both implementations
import { AuthProvider, useAuth as useNewAuth } from './auth/AuthProvider';
import { useAuth as useLegacyAuth } from './auth';
import { User } from '@supabase/supabase-js';
import { UserRole } from './auth/types';

// Wrapper hook that combines both implementations
export function useAuth() {
  const legacyAuth = useLegacyAuth();
  const newAuth = useNewAuth();

  // Create a combined API that supports both implementations
  return {
    // From legacy auth
    ...legacyAuth,
    // From new auth
    ...newAuth,
    // Add helper getters for role checks that may be missing in either implementation
    get isAdmin() {
      return newAuth.isAdmin || legacyAuth.hasRole('admin');
    },
    get isHR() {
      return newAuth.isHR || legacyAuth.hasRole('hr');
    },
    get isManager() {
      return newAuth.isManager || legacyAuth.isManager();
    },
    // Ensure methods are available
    hasRole: (role: UserRole | UserRole[]) => legacyAuth.hasRole(role),
    // Re-export components
    AuthProvider,
  };
}

// Re-export for backward compatibility
export * from './auth';
