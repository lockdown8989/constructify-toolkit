
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ManagerIdFieldProps {
  managerId: string | null;
  isManager: boolean;
}

export const ManagerIdField = ({ managerId, isManager }: ManagerIdFieldProps) => {
  const { toast } = useToast();
  
  const copyManagerId = () => {
    if (managerId) {
      navigator.clipboard.writeText(managerId);
      toast({
        title: "Manager ID copied",
        description: "Manager ID has been copied to clipboard",
      });
    }
  };
  
  // Don't render this component if the ID is already shown prominently (for managers)
  if (isManager && managerId) return null;
  
  return (
    <div className="space-y-2">
      <Label htmlFor="manager_id">
        {isManager ? "Your Manager ID" : "Your Manager's ID"}
      </Label>
      <div className="flex">
        <Input
          id="manager_id"
          value={managerId || ""}
          disabled
          className="bg-gray-100"
          placeholder={isManager && !managerId ? "Loading or generating ID..." : "Not available"}
        />
        {isManager && managerId && (
          <Button 
            type="button" 
            variant="outline" 
            className="ml-2" 
            onClick={copyManagerId}
            title="Copy Manager ID"
          >
            <Copy className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isManager ? (
        <p className="text-xs text-gray-500">
          {managerId 
            ? "Share this ID with your employees to connect them to your account" 
            : "Save your profile first to generate a Manager ID"}
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          {managerId 
            ? "This is the ID of your manager's account" 
            : "No manager connected to your account"}
        </p>
      )}
    </div>
  );
};
