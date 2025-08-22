
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
        
        // Fetch manager ID if the user is a manager - ensure it exists after registration
        if (isManager) {
          console.log("User is a manager, ensuring manager ID exists for user:", user.id);
          const { data: employeeData, error: employeeError } = await supabase
            .from("employees")
            .select("id, manager_id")
            .eq("user_id", user.id)
            .maybeSingle();
            
          console.log("Employee data query result:", { employeeData, employeeError });
            
          if (employeeError) {
            console.error("Error fetching manager ID:", employeeError);
            // Don't show error for missing employee records
          } else if (employeeData && employeeData.manager_id) {
            console.log("Found manager ID:", employeeData.manager_id);
            console.log("Setting managerId state to:", employeeData.manager_id);
            setManagerId(employeeData.manager_id);
            
            // Auto-reconnect employees when manager ID is found
            await reconnectEmployeesToManager(employeeData.manager_id);
          } else {
            // No manager ID found - create or update the manager record with a new ID
            try {
              const newManagerId = `MGR-${Math.floor(10000 + Math.random() * 90000)}`;
              console.log("No manager ID found; generating:", newManagerId);

              if (employeeData?.id) {
                // Update existing employee row for this manager
                const { error: updateError } = await supabase
                  .from("employees")
                  .update({ manager_id: newManagerId, job_title: 'Manager' })
                  .eq("id", employeeData.id);
                if (updateError) throw updateError;
              } else {
                // Create a new employee row for this manager
                const { data: profileData } = await supabase
                  .from("profiles")
                  .select("first_name, last_name")
                  .eq("id", user.id)
                  .maybeSingle();

                const fullName = profileData ?
                  `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() :
                  user.email?.split('@')[0] || 'Manager';

                const { error: insertError } = await supabase
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
                    user_id: user.id,
                  });
                if (insertError) throw insertError;
              }

              setManagerId(newManagerId);
              toast({
                title: "Manager ID created",
                description: `Your Manager ID is ${newManagerId}. Share this with your employees.`,
              });
            } catch (e) {
              console.error("Failed to create/update manager ID after registration:", e);
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
  
  console.log("useProfileData returning:", { profile, managerId, isLoading });
  return { profile, setProfile, managerId, isLoading };
};
