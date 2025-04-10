
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
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile:", error);
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
        
        // Fetch manager ID if the user is a manager - only retrieve, don't generate here
        if (isManager) {
          console.log("User is a manager, fetching manager ID");
          const { data: employeeData, error: employeeError } = await supabase
            .from("employees")
            .select("manager_id")
            .eq("user_id", user.id)
            .maybeSingle();
            
          if (employeeError) {
            console.error("Error fetching manager ID:", employeeError);
          } else if (employeeData && employeeData.manager_id) {
            console.log("Found manager ID:", employeeData.manager_id);
            setManagerId(employeeData.manager_id);
          } else {
            console.log("No manager ID found for this manager account");
            setManagerId(null);
          }
        } else {
          // Fetch manager ID for employee to display their manager's ID
          console.log("User is an employee, fetching their manager's ID");
          const { data: employeeData, error: employeeError } = await supabase
            .from("employees")
            .select("manager_id")
            .eq("user_id", user.id)
            .maybeSingle();
            
          if (!employeeError && employeeData && employeeData.manager_id) {
            console.log("Found employee's manager ID:", employeeData.manager_id);
            setManagerId(employeeData.manager_id);
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, isManager]);
  
  return { profile, setProfile, managerId, isLoading };
};
