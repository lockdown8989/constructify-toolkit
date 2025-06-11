
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Refresh, CheckCircle, XCircle, Loader2 } from "lucide-react";

type ManagerIdInputProps = {
  managerId: string;
  onGenerateManagerId: () => void;
  isReadOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEmployeeView?: boolean;
  isValid?: boolean | null;
  isChecking?: boolean;
  managerName?: string | null;
  disabled?: boolean;
};

export const ManagerIdInput = ({
  managerId,
  onGenerateManagerId,
  isReadOnly = true,
  onChange,
  isEmployeeView = false,
  isValid = null,
  isChecking = false,
  managerName = null,
  disabled = false
}: ManagerIdInputProps) => {
  const getValidationIcon = () => {
    if (isChecking) {
      return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
    }
    if (isValid === true) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (isValid === false) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="managerId">
        {isEmployeeView ? "Manager ID (Required)" : "Manager ID"}
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id="managerId"
            type="text"
            placeholder={isEmployeeView ? "Enter your manager's ID" : "Auto-generated"}
            value={managerId}
            onChange={onChange}
            readOnly={isReadOnly}
            disabled={disabled}
            className={`${!isReadOnly ? 'pr-10' : ''} ${
              isValid === false ? 'border-red-500' : 
              isValid === true ? 'border-green-500' : ''
            }`}
          />
          {!isReadOnly && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {getValidationIcon()}
            </div>
          )}
        </div>
        {isReadOnly && (
          <Button 
            type="button" 
            variant="outline" 
            onClick={onGenerateManagerId}
            disabled={disabled}
            className="shrink-0"
          >
            <Refresh className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isEmployeeView && managerName && (
        <p className="text-sm text-green-600">
          Manager found: {managerName}
        </p>
      )}
      {isEmployeeView && isValid === false && managerId && (
        <p className="text-sm text-red-600">
          Manager ID not found. Please check with your manager.
        </p>
      )}
      {!isEmployeeView && managerId && (
        <p className="text-sm text-muted-foreground">
          Share this ID with your employees so they can link to your account.
        </p>
      )}
    </div>
  );
};
