
export { AuthProvider, useAuth } from './AuthProvider';
export { useRoles } from './useRoles';
export { useAuthActions } from './useAuthActions';
export type { AuthContextType } from './types';

// Helper function to check if user is authenticated (for direct imports)
import { supabase } from "@/integrations/supabase/client";

export const isAuthenticated = () => {
  const session = supabase.auth.getSession();
  return !!session;
};
