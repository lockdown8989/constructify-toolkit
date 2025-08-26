import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, RefreshCw, Plus, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface AdminIdGeneratorProps {
  managerId: string | null;
  isManager: boolean;
  onIdGenerated?: (newId: string) => void;
}

export const AdminIdGenerator = ({ managerId, isManager, onIdGenerated }: AdminIdGeneratorProps) => {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = useState(false);
  const [justCopied, setJustCopied] = useState(false);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setJustCopied(true);
      toast({
        title: "Copied!",
        description: "Administrator ID copied to clipboard",
      });
      setTimeout(() => setJustCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Unable to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const generateAdminId = async () => {
    setIsGenerating(true);
    try {
      const { data: newManagerId, error: rpcError } = await supabase.rpc('generate_admin_id');
      
      if (rpcError) {
        throw new Error("Failed to generate unique Administrator ID");
      }

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      // Update the employee record with the new Administrator ID
      const { error: updateError } = await supabase
        .from("employees")
        .upsert({
          user_id: userData.user.id,
          manager_id: newManagerId,
          job_title: 'Administrator',
          department: 'Management',
          site: 'Main Office',
          status: 'Active',
          lifecycle: 'Active',
          salary: 0,
        }, {
          onConflict: 'user_id'
        });

      if (updateError) {
        throw new Error("Failed to update employee record");
      }

      toast({
        title: "Success!",
        description: `Your Administrator ID ${newManagerId} has been generated successfully.`,
      });

      // Notify parent component
      onIdGenerated?.(newManagerId);

      // Auto-copy the new ID
      await copyToClipboard(newManagerId);

    } catch (error) {
      console.error("Error generating Administrator ID:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate Administrator ID",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isManager) return null;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-primary">Administrator ID</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {managerId ? (
          <div className="space-y-3">
            <Label className="text-sm font-medium">Your Administrator ID</Label>
            <div className="flex items-center gap-2">
              <Input
                value={managerId}
                readOnly
                className="font-mono text-lg bg-background border-primary/30"
              />
              <Button
                onClick={() => copyToClipboard(managerId)}
                variant="outline"
                size="sm"
                className="px-3"
                disabled={justCopied}
              >
                {justCopied ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={generateAdminId}
                variant="outline"
                size="sm"
                disabled={isGenerating}
                className="text-xs"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Generate New ID
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share this ID with your employees so they can connect to your account during signup or in their profile settings.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Generate your Administrator ID to allow employees to connect to your account.
            </p>
            <Button
              onClick={generateAdminId}
              disabled={isGenerating}
              className="w-full"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Generate Administrator ID
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};