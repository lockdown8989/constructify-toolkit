
import { useState, useEffect } from "react";
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

  // Automatically generate manager ID when role changes to manager
  useEffect(() => {
    if (userRole === "manager" && !managerId) {
      console.log("Auto-generating manager ID for manager role");
      generateManagerId();
    }
  }, [userRole, managerId]);

  return { userRole, handleRoleChange, managerId, setManagerId, generateManagerId };
};
