
import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, AlertCircle } from "lucide-react";

type ManagerIdInputProps = {
  managerId: string;
  onGenerateManagerId: () => void;
  isReadOnly?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isEmployeeView?: boolean;
  isValid?: boolean;
  isChecking?: boolean;
  managerName?: string | null;
};

export const ManagerIdInput = ({ 
  managerId, 
  onGenerateManagerId, 
  isReadOnly = true,
  onChange,
  isEmployeeView = false,
  isValid,
  isChecking = false,
  managerName = null
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
        {isEmployeeView ? "Manager ID (Required)" : "Your Manager ID"}
      </Label>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Input
            id="managerId"
            value={managerId}
            onChange={onChange}
            readOnly={isReadOnly}
            placeholder={isEmployeeView ? "Enter your manager's ID (e.g., MGR-12345)" : ""}
            className={`${isReadOnly ? "bg-muted font-mono" : ""} ${getBorderClass()} pr-10`}
            required={isEmployeeView}
          />
          {isEmployeeView && managerId && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              {isChecking && <Loader2 className="h-4 w-4 animate-spin text-amber-500" />}
              {!isChecking && isValid === true && <CheckCircle2 className="h-4 w-4 text-green-500" />}
              {!isChecking && isValid === false && <AlertCircle className="h-4 w-4 text-red-500" />}
            </div>
          )}
        </div>
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
      
      {isEmployeeView ? (
        <>
          <p className="text-xs text-gray-500 font-medium">
            You must enter a valid Manager ID to connect to your manager's dashboard
          </p>
          {managerId && isValid === false && (
            <p className="text-xs text-red-500">
              This Manager ID could not be verified. Please check with your manager for the correct ID.
            </p>
          )}
          {managerId && isValid === true && managerName && (
            <p className="text-xs text-green-500">
              Valid Manager ID verified. You will be connected to manager: {managerName}
            </p>
          )}
        </>
      ) : (
        <p className="text-xs text-gray-500">
          Share this ID with your employees so they can connect to your account
        </p>
      )}
    </div>
  );
};
