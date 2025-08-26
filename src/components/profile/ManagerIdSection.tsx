
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Plus } from "lucide-react";
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
        title: "Administrator ID copied",
        description: "Administrator ID has been copied to clipboard",
      });
    }
  };

  const generateManagerId = async () => {
    setIsRegenerating(true);
    try {
      // Use the database RPC function to generate a unique Administrator ID
      const { data: newManagerId, error: rpcError } = await supabase.rpc('generate_admin_id');
      
      if (rpcError) {
        console.error("Error generating Administrator ID:", rpcError);
        throw new Error("Failed to generate unique Administrator ID");
      }
      
      console.log(`Generated new administrator ID: ${newManagerId}`);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      // Store the old manager ID for updating connected employees
      const oldManagerId = managerId;

      // Check if the user already has an employee record
      const { data: existingEmployee, error: checkError } = await supabase
        .from("employees")
        .select("id, manager_id")
        .eq("user_id", userData.user.id)
        .maybeSingle();
        
      if (checkError) {
        console.error("Error checking existing employee:", checkError);
        throw new Error("Failed to check existing records");
      }
      
      if (existingEmployee) {
        console.log("Existing employee record found, updating manager ID");
        // Update the manager's own record
        const { error } = await supabase
          .from("employees")
          .update({ 
            manager_id: newManagerId,
            job_title: 'Manager'
          })
          .eq("user_id", userData.user.id);

        if (error) {
          console.error("Error updating manager ID:", error);
          throw new Error("Failed to update manager ID");
        }

        // If there was an old manager ID, update all employees who were connected to it
        if (oldManagerId) {
          console.log(`Updating all employees connected to old manager ID: ${oldManagerId}`);
          const { data: connectedEmployees, error: updateError } = await supabase
            .from("employees")
            .update({ manager_id: newManagerId })
            .eq("manager_id", oldManagerId)
            .neq("user_id", userData.user.id) // Don't update the manager's own record again
            .select("name, user_id");

          if (updateError) {
            console.error("Error updating connected employees:", updateError);
            toast({
              title: "Partial Success",
              description: "Manager ID updated but some employees may need to reconnect manually.",
              variant: "default",
            });
          } else if (connectedEmployees && connectedEmployees.length > 0) {
            console.log(`Successfully updated ${connectedEmployees.length} connected employees`);
            
            // Send notifications to updated employees
            const notifications = connectedEmployees
              .filter(emp => emp.user_id) // Only send to employees with user accounts
              .map(emp => ({
                user_id: emp.user_id,
                title: "Administrator ID Updated",
                message: `Your administrator has updated their ID to ${newManagerId}. Your connection has been automatically maintained.`,
                type: "info",
                related_entity: "profile",
              }));

            if (notifications.length > 0) {
              await supabase.from("notifications").insert(notifications);
            }

            toast({
              title: "Success",
              description: `Administrator ID updated to ${newManagerId}. ${connectedEmployees.length} connected employees have been automatically updated.`,
            });
          } else {
            toast({
              title: "Success",
              description: `Administrator ID updated to ${newManagerId}.`,
            });
          }
        } else {
          toast({
            title: "Success",
            description: `Administrator ID generated: ${newManagerId}`,
          });
        }
      } else {
        // Create new employee record
        // Get profile data for the name
        const { data: profileData } = await supabase
          .from("profiles")
          .select("first_name, last_name")
          .eq("id", userData.user.id)
          .maybeSingle();
          
        const fullName = profileData ? 
          `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 
          userData.user.email?.split('@')[0] || 'Manager';
          
        console.log("Creating new employee record with manager ID:", newManagerId);
        const { error } = await supabase
          .from("employees")
          .insert({
            name: fullName,
            job_title: 'Manager',
            department: 'Management',
            site: 'Main Office',
            manager_id: newManagerId,
            status: 'Present',
            lifecycle: 'Employed',
            salary: 0,
            user_id: userData.user.id
          });

        if (error) {
          console.error("Error creating manager record:", error);
          throw new Error("Failed to create manager record: " + error.message);
        }

        toast({
          title: "Success",
          description: `Administrator ID generated: ${newManagerId}`,
        });
      }
      
      // Instead of reloading, trigger a re-render by updating parent state
      // The parent component should handle the state update
      toast({
        title: "Refreshing",
        description: "Updating your profile with the new Administrator ID...",
      });
      
      // Trigger a custom event to notify parent components
      window.dispatchEvent(new CustomEvent('adminIdUpdated', { 
        detail: { newManagerId } 
      }));
      
    } catch (error) {
      console.error("Error generating manager ID:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate Administrator ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };
  
  if (!isManager) return null;
  
  return (
    <div className="p-4 mb-4 bg-primary/5 border border-primary/20 rounded-lg">
      <h3 className="text-lg font-medium text-primary mb-1">Your Administrator ID</h3>
      {managerId ? (
        <>
          <div className="flex items-center">
            <span className="font-mono text-lg text-primary mr-2">{managerId}</span>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={copyManagerId}
              title="Copy Administrator ID"
              className="h-8 mr-2"
            >
              <Copy className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={generateManagerId}
              disabled={isRegenerating}
              title="Generate New ID"
              className="h-8"
            >
              <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Share this ID with your employees to connect them to your account. When you refresh this ID, all connected employees will be automatically updated.
          </p>
        </>
      ) : (
        <div className="flex flex-col">
          <p className="text-muted-foreground mb-2">No Administrator ID found. Generate one now:</p>
          <Button 
            type="button"
            variant="default"
            size="sm"
            onClick={generateManagerId}
            disabled={isRegenerating}
            className="w-fit"
          >
            {isRegenerating ? (
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
    </div>
  );
};
