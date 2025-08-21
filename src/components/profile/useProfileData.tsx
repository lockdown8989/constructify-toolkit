
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
          // Don't show error toast for missing profiles
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
            // Don't show error for missing employee records
          } else if (employeeData && employeeData.manager_id) {
            console.log("Found manager ID:", employeeData.manager_id);
            setManagerId(employeeData.manager_id);
            
            // Auto-reconnect employees when manager ID is found
            await reconnectEmployeesToManager(employeeData.manager_id);
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
        console.error("Error in fetchProfile:", error);
        // Don't show error toast for profile fetch errors
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user?.id, isManager]); // Removed toast from dependencies to prevent unnecessary re-renders
  
  const reconnectEmployeesToManager = async (currentManagerId: string) => {
    try {
      // Find all employees that might have been disconnected but should be connected to this manager
      const { data: allEmployees, error } = await supabase
        .from("employees")
        .select("id, name, user_id, manager_id")
        .neq("user_id", user?.id); // Exclude the manager themselves
        
      if (error) {
        console.error("Error fetching employees for reconnection:", error);
        return;
      }
      
      if (allEmployees && allEmployees.length > 0) {
        // Look for employees that might need to be reconnected
        const employeesNeedingReconnection = allEmployees.filter(emp => 
          !emp.manager_id || emp.manager_id === '' || emp.manager_id === 'undefined'
        );
        
        if (employeesNeedingReconnection.length > 0) {
          console.log(`Found ${employeesNeedingReconnection.length} employees that might need reconnection`);
          
          // Only show toast if user is still authenticated
          if (user) {
            toast({
              title: "Manager Profile Updated",
              description: `Your Manager ID (${currentManagerId}) is active. Employees can use this ID to connect to your account.`,
              variant: "default",
            });
          }
        }
      }
    } catch (error) {
      console.error("Error in reconnectEmployeesToManager:", error);
    }
  };
  
  return { profile, setProfile, managerId, isLoading };
};
