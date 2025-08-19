
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ManagerIdFieldProps {
  managerId: string | null;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isManager: boolean;
  isEditable?: boolean;
}

export const ManagerIdField = ({ managerId, onChange, isManager, isEditable = false }: ManagerIdFieldProps) => {
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
  // But do render it if the manager doesn't have an ID yet
  if (isManager && managerId) return null;
  
  return (
    <div className="space-y-2">
      <Label htmlFor="manager_id">
        {isManager ? "Your Manager ID" : "Your Manager's ID"}
      </Label>
      <div className="flex">
        <Input
          id="manager_id"
          name="manager_id"
          value={managerId || ""}
          onChange={onChange}
          disabled={!isEditable}
          className={`${!isEditable ? 'bg-gray-100' : ''} ${isManager ? 'font-mono' : ''}`}
          placeholder={isManager && !managerId ? "No Manager ID - Use button above to generate" : isEditable ? "Enter your manager's ID (e.g., MGR-12345)" : "Not available"}
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
            : "Use the 'Generate Manager ID' button above to create your Manager ID"}
        </p>
      ) : (
        <p className="text-xs text-gray-500">
          {isEditable
            ? "Enter your manager's ID to connect to their account"
            : managerId 
              ? "This is the ID of your manager's account" 
              : "No manager connected to your account"}
        </p>
      )}
    </div>
  );
};
