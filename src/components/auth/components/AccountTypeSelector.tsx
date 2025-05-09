
import React from "react";
import { Label } from "@/components/ui/label";
import { UserRole } from "@/hooks/auth/types";

type AccountTypeSelectorProps = {
  userRole: string;
  onRoleChange: (value: string) => void;
};

export const AccountTypeSelector = ({ userRole, onRoleChange }: AccountTypeSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label>Account Type</Label>
      <div className="flex flex-wrap gap-4">
        <div 
          className={`flex items-center border rounded-md px-4 py-2 cursor-pointer transition-colors ${userRole === "employee" ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-accent hover:text-accent-foreground"}`}
          onClick={() => onRoleChange("employee")}
        >
          <div className={`h-4 w-4 rounded-full border mr-2 flex items-center justify-center ${userRole === "employee" ? "border-primary-foreground" : "border-primary"}`}>
            {userRole === "employee" && (
              <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>
            )}
          </div>
          <Label htmlFor="employee" className="cursor-pointer">Employee</Label>
        </div>
        
        <div 
          className={`flex items-center border rounded-md px-4 py-2 cursor-pointer transition-colors ${userRole === "manager" ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-accent hover:text-accent-foreground"}`}
          onClick={() => onRoleChange("manager")}
        >
          <div className={`h-4 w-4 rounded-full border mr-2 flex items-center justify-center ${userRole === "manager" ? "border-primary-foreground" : "border-primary"}`}>
            {userRole === "manager" && (
              <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>
            )}
          </div>
          <Label htmlFor="manager" className="cursor-pointer">Manager</Label>
        </div>
      </div>
    </div>
  );
};
