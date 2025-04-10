
import { useAuth } from "@/hooks/use-auth";

export const useAccessControl = () => {
  const { isManager, isAdmin, isHR } = useAuth();
  
  // Determine if the current user has manager-level access
  const hasManagerAccess = isManager || isAdmin || isHR;
  
  return {
    hasManagerAccess
  };
};
