
import React from "react";
import { Label } from "@/components/ui/label";
import { UserRole } from "../hooks/useUserRole";

type AccountTypeSelectorProps = {
  userRole: UserRole;
  onRoleChange: (value: string) => void;
};

export const AccountTypeSelector = ({ userRole, onRoleChange }: AccountTypeSelectorProps) => {
  const accountTypes = [
    { id: "employee", label: "Employee" },
    { id: "manager", label: "Manager" },
    { id: "payroll", label: "Payroll" }
  ];

  return (
    <div className="space-y-3">
      <Label>Account Type</Label>
      <div className="flex flex-wrap gap-4">
        {accountTypes.map((type) => (
          <div 
            key={type.id}
            className={`flex items-center border rounded-md px-4 py-2 cursor-pointer transition-colors ${userRole === type.id ? "bg-primary text-primary-foreground border-primary" : "border-input bg-background hover:bg-accent hover:text-accent-foreground"}`}
            onClick={() => onRoleChange(type.id)}
          >
            <div className={`h-4 w-4 rounded-full border mr-2 flex items-center justify-center ${userRole === type.id ? "border-primary-foreground" : "border-primary"}`}>
              {userRole === type.id && (
                <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>
              )}
            </div>
            <Label htmlFor={type.id} className="cursor-pointer">{type.label}</Label>
          </div>
        ))}
      </div>
    </div>
  );
};
