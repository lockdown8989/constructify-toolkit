
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

interface ManagerIdFieldProps {
  managerId: string | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isManager: boolean;
  isEditable?: boolean;
}

export const ManagerIdField = ({ managerId, onChange, isManager, isEditable = false }: ManagerIdFieldProps) => {
  const { toast } = useToast();
  const [justCopied, setJustCopied] = useState(false);
  
  const copyManagerId = async () => {
    if (managerId) {
      try {
        await navigator.clipboard.writeText(managerId);
        setJustCopied(true);
        toast({
          title: "Administrator ID copied",
          description: "Administrator ID has been copied to clipboard",
        });
        setTimeout(() => setJustCopied(false), 2000);
      } catch (error) {
        toast({
          title: "Copy failed",
          description: "Unable to copy to clipboard",
          variant: "destructive",
        });
      }
    }
  };
  
  // Show manager ID prominently for administrators/managers
  if (isManager && managerId) {
    return (
      <div className="space-y-2">
        <Label className="text-lg font-semibold text-primary">Your Administrator ID</Label>
        <div className="flex items-center p-4 bg-primary/5 border border-primary/20 rounded-lg">
          <Input
            value={managerId}
            disabled
            className="font-mono text-lg font-semibold bg-transparent border-0 text-primary"
          />
          <Button 
            type="button" 
            variant="outline" 
            className="ml-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground" 
            onClick={copyManagerId}
            title="Copy Administrator ID"
            disabled={justCopied}
          >
            {justCopied ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <p className="text-sm text-primary/80 font-medium">
          Share this ID with your employees to connect them to your account
        </p>
      </div>
    );
  }

  // For administrators without an ID, show information message
  if (isManager && !managerId) {
    return (
      <div className="space-y-2">
        <Label className="text-lg font-semibold text-primary">Your Administrator ID</Label>
        <div className="p-4 bg-muted/50 border border-muted-foreground/20 rounded-lg">
          <p className="text-muted-foreground">
            No Administrator ID generated yet. Use the section below to generate your ID, or save your profile first.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <Label htmlFor="manager_id">
        {isManager ? "Your Administrator ID" : "Your Administrator's ID"}
      </Label>
      <div className="flex">
        <Input
          id="manager_id"
          name="manager_id"
          value={managerId || ""}
          onChange={onChange}
          disabled={!isEditable}
          className={`${!isEditable ? 'bg-gray-100' : ''} ${isManager ? 'font-mono' : ''}`}
          placeholder={isManager && !managerId ? "Loading or generating ID..." : isEditable ? "Enter Administrator's ID (ADM-#### or MGR-####)" : "Not available"}
        />
        {isManager && managerId && (
          <Button 
            type="button" 
            variant="outline" 
            className="ml-2" 
            onClick={copyManagerId}
            title="Copy Administrator ID"
            disabled={justCopied}
          >
            {justCopied ? (
              <CheckCircle className="h-4 w-4 text-green-600" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
      {isManager ? (
        <p className="text-xs text-gray-500">
          {managerId 
            ? "Share this ID with your employees to connect them to your account" 
            : "Save your profile first to generate an Administrator ID"}
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          {isEditable
            ? "Enter your administrator's ID to connect to their account"
            : managerId 
              ? "This is the ID of your administrator's account" 
              : "No administrator connected to your account"}
        </p>
      )}
    </div>
  );
};
