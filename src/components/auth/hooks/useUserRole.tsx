
import { useState, useEffect } from "react";

export type UserRole = "admin" | "hr" | "employee" | "employer";

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>("employee");
  const [managerId, setManagerId] = useState("");
  
  // Generate a unique manager ID when the form mounts
  useEffect(() => {
    if (userRole === "employer") {
      generateManagerId();
    }
  }, [userRole]);

  // Generate a unique manager ID (format: MGR-XXXXX)
  const generateManagerId = () => {
    const randomPart = Math.floor(10000 + Math.random() * 90000); // 5-digit number
    setManagerId(`MGR-${randomPart}`);
  };

  const handleRoleChange = (value: string) => {
    if (value === "admin" || value === "hr" || value === "employee" || value === "manager") {
      // If "manager" is selected, set userRole to "employer" for database compatibility
      setUserRole(value === "manager" ? "employer" : value as UserRole);
      console.log("Role selected:", value, "DB role:", value === "manager" ? "employer" : value);
      
      // Generate a manager ID if the role is manager
      if (value === "manager") {
        generateManagerId();
      } else {
        setManagerId("");
      }
    }
  };

  return {
    userRole,
    managerId,
    setManagerId,
    handleRoleChange,
    generateManagerId
  };
};
