
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type ManagerIdInputProps = {
  managerId: string;
  onGenerateManagerId: () => void;
  isReadOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEmployeeView?: boolean;
  isValid?: boolean;
  isChecking?: boolean;
};

export const ManagerIdInput = ({ 
  managerId, 
  onGenerateManagerId, 
  isReadOnly = true,
  onChange,
  isEmployeeView = false,
  isValid,
  isChecking = false
}: ManagerIdInputProps) => {
  const getBorderClass = () => {
    if (isEmployeeView && managerId) {
      if (isChecking) return "border-amber-500";
      if (isValid === true) return "border-green-500";
      if (isValid === false) return "border-red-500";
    }
    return "";
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="managerId">
        {isEmployeeView ? "Manager ID (Optional)" : "Your Manager ID"}
      </Label>
      <div className="flex gap-2">
        <Input
          id="managerId"
          value={managerId}
          onChange={onChange}
          readOnly={isReadOnly}
          placeholder={isEmployeeView ? "Enter your manager's ID (e.g., MGR-12345)" : ""}
          className={`${isReadOnly ? "bg-muted font-mono" : ""} ${getBorderClass()}`}
        />
        {!isEmployeeView && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onGenerateManagerId}
            className="whitespace-nowrap"
          >
            Generate New
          </Button>
        )}
      </div>
      <p className="text-xs text-gray-500">
        {isEmployeeView 
          ? "If you have a Manager ID, enter it to link your account to your manager" 
          : "Share this ID with your employees so they can connect to your account"}
      </p>
      {isEmployeeView && managerId && isValid === false && (
        <p className="text-xs text-red-500">
          This Manager ID could not be verified. You can still proceed and update it later.
        </p>
      )}
      {isEmployeeView && managerId && isValid === true && (
        <p className="text-xs text-green-500">
          Valid Manager ID verified.
        </p>
      )}
    </div>
  );
};
