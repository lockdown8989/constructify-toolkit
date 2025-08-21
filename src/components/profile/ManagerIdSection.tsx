
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ManagerIdSectionProps {
  managerId: string | null;
  isManager: boolean;
}

export const ManagerIdSection = ({ managerId, isManager }: ManagerIdSectionProps) => {
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentManagerId, setCurrentManagerId] = useState<string | null>(managerId);
  
  // Update local state when prop changes
  useEffect(() => {
    setCurrentManagerId(managerId);
  }, [managerId]);

  // Fetch manager ID on component mount for managers
  useEffect(() => {
    const fetchManagerId = async () => {
      if (!isManager) return;
      
      try {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) return;

        const { data: managerData, error } = await supabase.rpc(
          'get_manager_details',
          { p_user_id: userData.user.id }
        );

        if (!error && managerData && managerData.length > 0) {
          const manager = managerData[0];
          setCurrentManagerId(manager.manager_id);
        }
      } catch (error) {
        console.error("Error fetching manager ID:", error);
      }
    };

    fetchManagerId();
  }, [isManager]);
  
  const copyManagerId = () => {
    if (currentManagerId) {
      navigator.clipboard.writeText(currentManagerId);
      toast({
        title: "Manager ID copied",
        description: "Manager ID has been copied to clipboard",
      });
    }
  };

  const generateManagerId = async () => {
    setIsRegenerating(true);
    try {
      const randomPart = Math.floor(10000 + Math.random() * 90000);
      const newManagerId = `MGR-${randomPart}`;
      console.log(`Generated new manager ID: ${newManagerId}`);

      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        throw new Error("User not authenticated");
      }

      const oldManagerId = currentManagerId;

      // Check if user has an employee record
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
        console.log("Updating existing employee record with manager ID");
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

        // Update connected employees if there was an old manager ID
        if (oldManagerId) {
          console.log(`Updating employees connected to old manager ID: ${oldManagerId}`);
          const { data: connectedEmployees, error: updateError } = await supabase
            .from("employees")
            .update({ manager_id: newManagerId })
            .eq("manager_id", oldManagerId)
            .neq("user_id", userData.user.id)
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
              .filter(emp => emp.user_id)
              .map(emp => ({
                user_id: emp.user_id,
                title: "Manager ID Updated",
                message: `Your manager has updated their ID to ${newManagerId}. Your connection has been automatically maintained.`,
                type: "info",
                related_entity: "profile",
              }));

            if (notifications.length > 0) {
              await supabase.from("notifications").insert(notifications);
            }

            toast({
              title: "Success",
              description: `Manager ID updated to ${newManagerId}. ${connectedEmployees.length} connected employees have been automatically updated.`,
            });
          }
        }
        
        // Update local state immediately
        setCurrentManagerId(newManagerId);
        
        toast({
          title: "Success",
          description: `Manager ID ${oldManagerId ? 'updated to' : 'generated:'} ${newManagerId}`,
        });
      } else {
        // Create new employee record
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
            status: 'Active',
            lifecycle: 'Active',
            salary: 0,
            user_id: userData.user.id
          });

        if (error) {
          console.error("Error creating manager record:", error);
          throw new Error("Failed to create manager record: " + error.message);
        }

        // Update local state immediately
        setCurrentManagerId(newManagerId);

        toast({
          title: "Success",
          description: `Manager ID generated: ${newManagerId}`,
        });
      }
      
    } catch (error) {
      console.error("Error generating manager ID:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate Manager ID. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };
  
  if (!isManager) return null;
  
  return (
    <div className="p-4 mb-4 bg-blue-50 border border-blue-200 rounded-md">
      <h3 className="text-lg font-medium text-blue-800 mb-1">Your Manager ID</h3>
      {currentManagerId ? (
        <>
          <div className="flex items-center flex-wrap gap-2">
            <span className="font-mono text-lg text-blue-700 break-all">{currentManagerId}</span>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={copyManagerId}
                title="Copy Manager ID"
                className="h-8 shrink-0"
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
                className="h-8 shrink-0"
              >
                <RefreshCw className={`h-4 w-4 ${isRegenerating ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
          <p className="text-sm text-blue-600 mt-2">
            Share this ID with your employees to connect them to your account. When you refresh this ID, all connected employees will be automatically updated.
          </p>
        </>
      ) : (
        <div className="flex flex-col">
          <p className="text-blue-600 mb-2">No Manager ID found. Generate one now:</p>
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
                Generate Manager ID
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
