
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ProfileData {
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  email: string;
  manager_id: string;
  avatar_url: string | null;
}

export const useProfileForm = (user: User | null) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    position: "",
    department: "",
    email: "",
    manager_id: "",
    avatar_url: null,
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name, position, department, avatar_url")
          .eq("id", user.id)
          .maybeSingle();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return;
        }

        // Fetch manager ID from employees table
        const { data: employeeData, error: employeeError } = await supabase
          .from("employees")
          .select("manager_id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (employeeError) {
          console.error("Error fetching employee data:", employeeError);
        }
        
        setProfile({
          first_name: profileData?.first_name || "",
          last_name: profileData?.last_name || "",
          position: profileData?.position || "",
          department: profileData?.department || "",
          email: user.email || "",
          manager_id: employeeData?.manager_id || "",
          avatar_url: profileData?.avatar_url || null,
        });
      } catch (error) {
        console.error("Error:", error);
      }
    };
    
    fetchProfileData();
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (url: string | null) => {
    setProfile((prev) => ({ ...prev, avatar_url: url }));
  };

  const syncWithManagerAndPayroll = async (managerId: string, employeeId: string) => {
    try {
      console.log(`Synchronizing employee ${employeeId} with manager ID ${managerId}`);
      
      // Find the manager's employee record
      const { data: managerEmployee, error: managerError } = await supabase
        .from("employees")
        .select("id, user_id, name")
        .eq("manager_id", managerId)
        .maybeSingle();

      if (managerError) {
        console.error("Error finding manager:", managerError);
        return;
      }

      if (managerEmployee) {
        console.log(`Found manager: ${managerEmployee.name}`);
        
        // Update the employee's manager_id to link them properly
        const { error: updateError } = await supabase
          .from("employees")
          .update({ manager_id: managerId })
          .eq("id", employeeId);

        if (updateError) {
          console.error("Error updating employee manager link:", updateError);
        } else {
          console.log("Successfully synchronized employee with manager");
        }

        // Find payroll users to sync with
        const { data: payrollUsers, error: payrollError } = await supabase
          .from("user_roles")
          .select("user_id")
          .eq("role", "payroll");

        if (payrollError) {
          console.error("Error finding payroll users:", payrollError);
          return;
        }

        // Update payroll users' employee records to have the same manager_id for synchronization
        for (const payrollUser of payrollUsers) {
          const { error: payrollSyncError } = await supabase
            .from("employees")
            .update({ manager_id: managerId })
            .eq("user_id", payrollUser.user_id);

          if (payrollSyncError) {
            console.error("Error syncing with payroll user:", payrollSyncError);
          } else {
            console.log("Successfully synchronized with payroll administrator");
          }
        }
      }
    } catch (error) {
      console.error("Error in manager/payroll synchronization:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      // Update profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          position: profile.position,
          department: profile.department,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      
      if (profileError) {
        toast({
          title: "Error updating profile",
          description: profileError.message,
          variant: "destructive",
        });
        return;
      }

      // Update email if changed
      if (profile.email !== user.email) {
        const { error: emailError } = await supabase.auth.updateUser({
          email: profile.email
        });

        if (emailError) {
          toast({
            title: "Error updating email",
            description: emailError.message,
            variant: "destructive",
          });
          return;
        }
      }

      // Handle manager ID update and synchronization
      if (profile.manager_id) {
        // Check if employee record exists
        const { data: existingEmployee, error: checkError } = await supabase
          .from("employees")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle();

        if (checkError) {
          console.error("Error checking employee record:", checkError);
        } else if (existingEmployee) {
          // Update existing record and sync with manager/payroll
          const { error: updateError } = await supabase
            .from("employees")
            .update({ manager_id: profile.manager_id })
            .eq("user_id", user.id);

          if (updateError) {
            console.error("Error updating manager ID:", updateError);
            toast({
              title: "Error updating manager ID",
              description: updateError.message,
              variant: "destructive",
            });
            return;
          }

          // Synchronize with manager and payroll accounts
          await syncWithManagerAndPayroll(profile.manager_id, existingEmployee.id);
        } else {
          // Create new employee record
          const { data: profileData } = await supabase
            .from("profiles")
            .select("first_name, last_name")
            .eq("id", user.id)
            .maybeSingle();

          const fullName = profileData ? 
            `${profileData.first_name || ''} ${profileData.last_name || ''}`.trim() : 
            user.email?.split('@')[0] || 'Employee';

          const { data: newEmployee, error: insertError } = await supabase
            .from("employees")
            .insert({
              name: fullName,
              job_title: profile.position || 'Employee',
              department: profile.department || 'General',
              site: 'Main Office',
              manager_id: profile.manager_id,
              status: 'Active',
              lifecycle: 'Employed',
              salary: 0,
              user_id: user.id,
              avatar_url: profile.avatar_url
            })
            .select()
            .single();

          if (insertError) {
            console.error("Error creating employee record:", insertError);
            toast({
              title: "Error updating manager ID",
              description: insertError.message,
              variant: "destructive",
            });
            return;
          }

          // Synchronize with manager and payroll accounts
          if (newEmployee) {
            await syncWithManagerAndPayroll(profile.manager_id, newEmployee.id);
          }
        }
      }
      
      toast({
        title: "Profile updated successfully",
        description: "Your profile has been updated and synchronized with your manager and payroll accounts.",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "An unexpected error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    profile,
    isSaving,
    handleChange,
    handleSubmit,
    handleAvatarChange
  };
};
