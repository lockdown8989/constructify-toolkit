
import { useAuth } from "@/hooks/use-auth";

export const useAccessControl = () => {
  const { isManager, isAdmin, isHR } = useAuth();
  
  // Managers have administrator access
  const hasManagerAccess = isManager || isAdmin || isHR;
  
  // For backward compatibility, treat managers as having admin access
  const hasAdminAccess = isManager || isAdmin;
  
  return {
    hasManagerAccess,
    hasAdminAccess
  };
};
