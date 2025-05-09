
import { useState } from "react";
import { UserRole } from "@/hooks/auth/types";

export const useUserRole = (initialRole: string = "employee") => {
  const [userRole, setUserRole] = useState<string>(initialRole);
  const [managerId, setManagerId] = useState<string>("");

  // Handler for role change
  const handleRoleChange = (role: string) => {
    setUserRole(role);
  };

  // Generate a new manager ID
  const generateManagerId = () => {
    const randomId = Math.floor(10000 + Math.random() * 90000);
    setManagerId(`MGR-${randomId}`);
  };

  return { userRole, handleRoleChange, managerId, setManagerId, generateManagerId };
};
