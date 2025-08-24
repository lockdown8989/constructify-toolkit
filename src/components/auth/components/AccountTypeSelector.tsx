
import React from "react";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { UserRole } from "../hooks/useUserRole";

type AccountTypeSelectorProps = {
  userRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  disabled?: boolean;
};

export const AccountTypeSelector = ({ userRole, onRoleChange, disabled = false }: AccountTypeSelectorProps) => {
  return (
    <div className="space-y-3">
      <Label className="text-base font-medium">Account Type</Label>
      <RadioGroup 
        value={userRole} 
        onValueChange={onRoleChange}
        disabled={disabled}
        className="flex flex-col space-y-2"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="employee" id="employee" disabled={disabled} />
          <Label htmlFor="employee" className={disabled ? "text-muted-foreground" : ""}>
            Employee
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="admin" id="admin" disabled={disabled} />
          <Label htmlFor="admin" className={disabled ? "text-muted-foreground" : ""}>
            Admin (Administrator)
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="payroll" id="payroll" disabled={disabled} />
          <Label htmlFor="payroll" className={disabled ? "text-muted-foreground" : ""}>
            Payroll Administrator
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
};
