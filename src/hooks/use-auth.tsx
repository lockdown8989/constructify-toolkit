
// Import directly from the auth file
import { useAuth as useAuthHook, AuthProvider } from "./auth";

// Re-export for use throughout the application
export { AuthProvider };

export function useAuth() {
  return useAuthHook();
}
