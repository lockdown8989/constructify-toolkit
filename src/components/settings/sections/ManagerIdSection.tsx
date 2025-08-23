import { useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";

interface ManagerIdSectionProps {
  managerId: string | null;
  onManagerIdUpdate: (newId: string) => void;
}

export const ManagerIdSection = ({ managerId, onManagerIdUpdate }: ManagerIdSectionProps) => {
  const { isManager } = useAuth();
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  if (!isManager) {
    return null;
  }

  const copyManagerId = () => {
    if (managerId) {
      navigator.clipboard.writeText(managerId);
      toast({
        title: "Copied!",
        description: "Manager ID copied to clipboard",
      });
    }
  };

  const regenerateManagerId = async () => {
    setIsRegenerating(true);
    try {
      // Force regeneration by clearing current ID and calling RPC
      await supabase
        .from("employees")
        .update({ manager_id: null })
        .eq("user_id", (await supabase.auth.getUser()).data.user?.id);
        
      const { data: newManagerId, error } = await supabase
        .rpc("get_or_create_manager_id");
        
      if (error) {
        throw error;
      }
      
      onManagerIdUpdate(newManagerId);
      
      toast({
        title: "Manager ID Regenerated",
        description: `Your new Manager ID is ${newManagerId}. Make sure to share the updated ID with your employees.`,
        variant: "default",
      });
      
    } catch (error) {
      console.error("Error regenerating Manager ID:", error);
      toast({
        title: "Error",
        description: "Failed to regenerate Manager ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <Card className="border rounded-xl shadow-sm">
      <CardHeader className="bg-muted/30">
        <CardTitle className="text-xl font-medium">Manager ID</CardTitle>
        <CardDescription>
          Your unique Manager ID that employees use to connect to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {managerId ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="manager-id-display">Your Manager ID</Label>
              <div className="flex space-x-2">
                <Input
                  id="manager-id-display"
                  value={isVisible ? managerId : "•".repeat(managerId.length)}
                  readOnly
                  className="font-mono bg-muted"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsVisible(!isVisible)}
                  title={isVisible ? "Hide ID" : "Show ID"}
                >
                  {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={copyManagerId}
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={regenerateManagerId}
                disabled={isRegenerating}
                className="flex-1"
              >
                {isRegenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Regenerating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Regenerate ID
                  </>
                )}
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Share this ID with your employees so they can connect to your account. 
              Regenerating will create a new ID and disconnect all current employees.
            </p>
          </>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Loading your Manager ID...
            </p>
            <Button
              onClick={regenerateManagerId}
              disabled={isRegenerating}
              className="w-full"
            >
              {isRegenerating ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Manager ID"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};