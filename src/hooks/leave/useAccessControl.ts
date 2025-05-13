
import { useAuth } from "@/hooks/use-auth";

export const useAccessControl = () => {
  const auth = useAuth();
  
  // Determine if the current user has manager-level access
  const hasManagerAccess = auth.isManager || auth.isAdmin || auth.isHR;
  
  return {
    hasManagerAccess
  };
};
