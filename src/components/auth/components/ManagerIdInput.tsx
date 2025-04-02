
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
};

export const ManagerIdInput = ({ 
  managerId, 
  onGenerateManagerId, 
  isReadOnly = true,
  onChange,
  isEmployeeView = false
}: ManagerIdInputProps) => {
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
          className={isReadOnly ? "bg-muted font-mono" : ""}
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
          ? "If you have a Manager ID, enter it to link your account" 
          : "Share this ID with your employees so they can connect to your account"}
      </p>
    </div>
  );
};
