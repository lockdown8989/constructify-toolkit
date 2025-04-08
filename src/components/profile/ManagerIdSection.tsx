
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ManagerIdSectionProps {
  managerId: string | null;
  isManager: boolean;
}

export const ManagerIdSection = ({ managerId, isManager }: ManagerIdSectionProps) => {
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  
  const copyManagerId = () => {
    if (managerId) {
      navigator.clipboard.writeText(managerId);
      toast({
        title: "Manager ID copied",
        description: "Manager ID has been copied to clipboard",
      });
    }
  };

  const regenerateManagerId = async () => {
    setIsRegenerating(true);
    try {
      // Generate a new manager ID with format MGR-XXXXX
      const randomPart = Math.floor(10000 + Math.random() * 90000); // 5-digit number
      const newManagerId = `MGR-${randomPart}`;

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        // Update the employee record with the new manager ID
        const { error } = await supabase
          .from("employees")
          .update({ manager_id: newManagerId })
          .eq("user_id", userData.user.id);

        if (error) {
          console.error("Error updating manager ID:", error);
          toast({
            title: "Error",
            description: "Failed to regenerate Manager ID. Please try again.",
            variant: "destructive",
          });
        } else {
          // Reload the page to fetch the new manager ID
          toast({
            title: "Success",
            description: `New Manager ID generated: ${newManagerId}`,
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setIsRegenerating(false);
    }
  };
  
  if (!isManager) return null;
  
  return (
    <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-md">
      <h3 className="text-lg font-medium text-blue-800 mb-1">Your Manager ID</h3>
      {managerId ? (
        <>
          <div className="flex items-center">
            <span className="font-mono text-lg text-blue-700 mr-2">{managerId}</span>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={copyManagerId}
              title="Copy Manager ID"
              className="h-8 mr-2"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={regenerateManagerId}
              disabled={isRegenerating}
              title="Generate New ID"
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-sm text-blue-600 mt-1">
            Share this ID with your employees to connect them to your account
          </p>
        </>
      ) : (
        <div className="flex flex-col">
          <p className="text-blue-600 mb-2">No Manager ID found. Generate one now:</p>
          <Button 
            type="button"
            variant="default"
            size="sm"
            onClick={regenerateManagerId}
            disabled={isRegenerating}
            className="w-fit"
          >
            {isRegenerating ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Manager ID"
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
