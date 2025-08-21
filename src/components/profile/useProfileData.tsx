
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  preferred_currency: string;
  country: string;
}

export const useProfileData = (user: User | null, isManager: boolean) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    position: "",
    department: "",
    preferred_currency: "USD",
    country: "",
  });
  const [managerId, setManagerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile:", error);
          setIsLoading(false);
          return;
        }
        
        if (data) {
          setProfile({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            position: data.position || "",
            department: data.department || "",
            preferred_currency: data.preferred_currency || "USD",
            country: data.country || "",
          });
        }
        
        // Use the new database function to get manager details
        console.log("Fetching manager details for user:", user.id);
        const { data: managerData, error: managerError } = await supabase.rpc(
          'get_manager_details',
          { p_user_id: user.id }
        );
        
        if (managerError) {
          console.error("Error fetching manager details:", managerError);
        } else if (managerData && managerData.length > 0) {
          const manager = managerData[0];
          console.log("Found manager details:", manager);
          setManagerId(manager.manager_id);
          
          if (isManager) {
            toast({
              title: "Manager Profile Loaded",
              description: `Your Manager ID (${manager.manager_id}) is ready for sharing with employees.`,
              variant: "default",
            });
          }
        } else {
          console.log("No manager details found for user");
          setManagerId(null);
        }
      } catch (error) {
        console.error("Error in fetchProfile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user?.id, isManager, toast]);
  
  return { profile, setProfile, managerId, isLoading };
};
