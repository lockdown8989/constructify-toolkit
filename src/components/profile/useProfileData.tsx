
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
        // Start loading
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile:", error);
          toast({
            title: "Error",
            description: "Failed to load profile data. Please try refreshing the page.",
            variant: "destructive",
          });
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
        
        // Fetch manager ID if the user is a manager
        if (isManager) {
          console.log("User is a manager, fetching manager ID");
          const { data: employeeData, error: employeeError } = await supabase
            .from("employees")
            .select("manager_id")
            .eq("user_id", user.id)
            .eq("job_title", "Manager")
            .maybeSingle();
            
          if (employeeError) {
            console.error("Error fetching manager ID:", employeeError);
            toast({
              title: "Warning",
              description: "Could not retrieve your Manager ID. Please try refreshing.",
              variant: "default",
            });
          } else if (employeeData && employeeData.manager_id) {
            console.log("Found manager ID:", employeeData.manager_id);
            setManagerId(employeeData.manager_id);
          } else {
            console.log("No manager ID found, checking if user has employer role");
            
            // If no result, try looking in the user_roles to see if they're definitely a manager
            const { data: roleData } = await supabase
              .from('user_roles')
              .select('role')
              .eq('user_id', user.id)
              .eq('role', 'employer');
              
            console.log("Roles from database:", roleData);
            console.log("Has employer role directly from DB:", roleData && roleData.length > 0);
            
            if (roleData && roleData.length > 0) {
              // Generate a new manager ID with format MGR-XXXXX
              const randomPart = Math.floor(10000 + Math.random() * 90000); // 5-digit number
              const newManagerId = `MGR-${randomPart}`;
              console.log("Creating new manager ID:", newManagerId);
              
              // Check if they have ANY employee record
              const { data: anyEmployeeRecord } = await supabase
                .from("employees")
                .select("id, status, lifecycle")
                .eq("user_id", user.id)
                .maybeSingle();
                
              if (!anyEmployeeRecord) {
                // Create an employee record for the manager
                const { error: insertError } = await supabase
                  .from("employees")
                  .insert({
                    name: `${profile.first_name} ${profile.last_name}`.trim() || user.email?.split('@')[0] || 'Manager',
                    job_title: 'Manager',
                    department: profile.department || 'Management',
                    site: 'Main Office',
                    manager_id: newManagerId,
                    status: 'Active', // Use an allowed value from the database
                    lifecycle: 'Employed', // Use an allowed value from the database
                    salary: 0,
                    user_id: user.id
                  });
                  
                if (insertError) {
                  console.error("Error creating manager employee record:", insertError);
                  toast({
                    title: "Error",
                    description: "Failed to generate your Manager ID. Please contact support.",
                    variant: "destructive",
                  });
                } else {
                  setManagerId(newManagerId);
                  toast({
                    title: "Manager ID created",
                    description: `A Manager ID (${newManagerId}) has been created for your account.`,
                    duration: 5000
                  });
                }
              } else {
                console.log("User has employee record but no manager ID, updating record:", anyEmployeeRecord);
                
                // They have an employee record but no manager ID, update their record
                const { error: updateError } = await supabase
                  .from("employees")
                  .update({ 
                    manager_id: newManagerId,
                    job_title: 'Manager' 
                  })
                  .eq("user_id", user.id);
                  
                if (updateError) {
                  console.error("Error updating employee with manager ID:", updateError);
                  toast({
                    title: "Error",
                    description: "Failed to update your Manager ID. Please try again later.",
                    variant: "destructive",
                  });
                } else {
                  setManagerId(newManagerId);
                  toast({
                    title: "Manager ID created",
                    description: `A Manager ID (${newManagerId}) has been created for your account.`,
                    duration: 5000
                  });
                }
              }
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
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try refreshing the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfile();
  }, [user, isManager, toast, profile.first_name, profile.last_name, profile.department]);
  
  return { profile, setProfile, managerId, isLoading };
};
