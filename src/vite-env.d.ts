
/// <reference types="vite/client" />

// Add type definitions for our custom RPC functions
interface Database {
  public: {
    Functions: {
      get_user_roles: (args: { p_user_id: string }) => string[];
      has_role: (args: { p_user_id: string, p_role_name: string }) => boolean;
    }
  }
}
