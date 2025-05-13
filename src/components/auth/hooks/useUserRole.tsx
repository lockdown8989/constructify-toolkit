
import { useState } from "react";
import { UserRole } from "@/hooks/auth/types";

export { type UserRole };

export const useUserRole = (initialRole: UserRole = "employee") => {
  const [userRole, setUserRole] = useState<UserRole>(initialRole);
  const [managerId, setManagerId] = useState<string>("");

  // Handler for role change
  const handleRoleChange = (role: string) => {
    setUserRole(role as UserRole);
  };

  // Generate a new manager ID
  const generateManagerId = () => {
    const randomId = Math.floor(10000 + Math.random() * 90000);
    setManagerId(`MGR-${randomId}`);
  };

  return { userRole, handleRoleChange, managerId, setManagerId, generateManagerId };
};
