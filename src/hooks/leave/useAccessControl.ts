
import { useAuth } from "@/hooks/auth";

export const useAccessControl = () => {
  const { isManager, isAdmin, isHR, user } = useAuth();
  
  // Determine if the current user has manager-level access
  const hasManagerAccess = isManager || isAdmin || isHR;
  
  // Log the access control state for debugging
  console.log("Access control state:", { 
    isManager, 
    isAdmin, 
    isHR, 
    userId: user?.id,
    hasManagerAccess
  });
  
  return {
    hasManagerAccess,
    isManager,
    isAdmin, 
    isHR,
    userId: user?.id
  };
};
