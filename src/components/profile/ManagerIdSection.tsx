
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
        title: "Manager ID copied",
        description: "Manager ID has been copied to clipboard",
      });
    }
  };

  const generateManagerId = async () => {
    setIsRegenerating(true);
    try {
      // Generate a new manager ID with format MGR-XXXXX
      const randomPart = Math.floor(10000 + Math.random() * 90000); // 5-digit number
      const newManagerId = `MGR-${randomPart}`;

      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        // Check if the user already has an employee record
        const { data: existingEmployee, error: checkError } = await supabase
          .from("employees")
          .select("id")
          .eq("user_id", userData.user.id)
          .maybeSingle();
          
        if (checkError) {
          console.error("Error checking existing employee:", checkError);
          toast({
            title: "Error",
            description: "Failed to check existing records. Please try again.",
            variant: "destructive",
          });
          setIsRegenerating(false);
          return;
        }
        
        if (existingEmployee) {
          // Update existing record
          const { error } = await supabase
            .from("employees")
            .update({ 
              manager_id: newManagerId,
              job_title: 'Manager',
              status: 'Active',
              lifecycle: 'Employed' 
            })
            .eq("user_id", userData.user.id);

          if (error) {
            console.error("Error updating manager ID:", error);
            toast({
              title: "Error",
              description: "Failed to generate Manager ID. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Success",
              description: `New Manager ID generated: ${newManagerId}`,
            });
            setTimeout(() => {
              window.location.reload();
            }, 1500);
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
            
          const { error } = await supabase
            .from("employees")
            .insert({
              name: fullName,
              job_title: 'Manager',
              department: 'Management',
              site: 'Main Office',
              manager_id: newManagerId,
              status: 'Active',
              lifecycle: 'Employed',
              salary: 0,
              user_id: userData.user.id
            });

          if (error) {
            console.error("Error creating manager record:", error);
            toast({
              title: "Error",
              description: "Failed to generate Manager ID. Please try again.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Success",
              description: `New Manager ID generated: ${newManagerId}`,
            });
            setTimeout(() => {
              window.location.reload();
            }, 1500);
          }
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
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
              onClick={generateManagerId}
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
