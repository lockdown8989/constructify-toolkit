
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  first_name: string;
  last_name: string;
  position: string;
  department: string;
}

export const useProfileData = (user: User | null, isManager: boolean) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    position: "",
    department: "",
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
            // Only if we don't find a manager ID, check if they have the employer role
            // but DON'T generate a new ID here, just suggest the user to do so
            console.log("No manager ID found, checking if user has employer role");
            
            // Check if they're definitely a manager
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .eq('role', 'employer');
              
            console.log("Roles from database:", roleData);
            
            if (roleData && roleData.length > 0) {
              console.log("User has employer role but no manager ID set yet");
              // Set managerId to null, don't generate a new one
              setManagerId(null);
            }
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
