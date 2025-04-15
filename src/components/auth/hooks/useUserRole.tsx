
import { useState } from "react";
import { UserRole } from "@/hooks/auth/types";

export { type UserRole };

export const useUserRole = (initialRole: UserRole = "employee") => {
  const [userRole, setUserRole] = useState<UserRole>(initialRole);

  // Handler for role change
  const handleRoleChange = (role: string) => {
    setUserRole(role as UserRole);
  };

  return { userRole, handleRoleChange };
};
