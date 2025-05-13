
import { useAuth } from "@/hooks/auth";

export const useAccessControl = () => {
  const { isManager, isAdmin, isHR, user } = useAuth();
  
  // Determine if the current user has manager-level access
  const hasManagerAccess = isManager || isAdmin || isHR;
  
  return {
    hasManagerAccess,
    userId: user?.id
  };
};
