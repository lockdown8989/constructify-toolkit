
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ManagerIdSectionProps {
  managerId: string | null;
  isManager: boolean;
}

export const ManagerIdSection = ({ managerId, isManager }: ManagerIdSectionProps) => {
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
  
  if (!isManager || !managerId) return null;
  
  return (
    <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-md">
      <h3 className="text-lg font-medium text-blue-800 mb-1">Your Manager ID</h3>
      <div className="flex items-center">
        <span className="font-mono text-lg text-blue-700 mr-2">{managerId}</span>
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={copyManagerId}
          title="Copy Manager ID"
          className="h-8"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
      <p className="text-sm text-blue-600 mt-1">
        Share this ID with your employees to connect them to your account
      </p>
    </div>
  );
};
