
import { useState, useEffect } from "react";

export type UserRole = "admin" | "hr" | "employee" | "employer";

export const useUserRole = () => {
  const [userRole, setUserRole] = useState<UserRole>("employee");
  const [managerId, setManagerId] = useState("");
  
  // Generate a unique manager ID only when role first changes to employer
  useEffect(() => {
    if (userRole === "employer" && !managerId) {
      generateManagerId();
    }
  }, [userRole]);

  // Generate a unique manager ID (format: MGR-XXXXX)
  const generateManagerId = () => {
    // Ensure 5-digit format with leading zeros if needed
    const randomPart = Math.floor(10000 + Math.random() * 90000); // 5-digit number
    const newManagerId = `MGR-${randomPart}`;
    console.log(`Generated manager ID: ${newManagerId}`);
    setManagerId(newManagerId);
  };

  const handleRoleChange = (value: string) => {
    if (value === "admin" || value === "hr" || value === "employee" || value === "manager") {
      // If "manager" is selected, set userRole to "employer" for database compatibility
      const newRole = value === "manager" ? "employer" : value as UserRole;
      setUserRole(newRole);
      console.log("Role selected:", value, "DB role:", newRole);
      
      // Generate a manager ID if the role is manager and no ID exists yet
      if (value === "manager" && !managerId) {
        generateManagerId();
      } else if (value !== "manager") {
        // Clear manager ID when switching to other roles
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
