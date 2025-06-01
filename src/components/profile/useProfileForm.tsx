
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
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name, position, department")
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

      // Update manager ID in employees table
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
          // Update existing record
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

          const { error: insertError } = await supabase
            .from("employees")
            .insert({
              name: fullName,
              job_title: profile.position || 'Employee',
              department: profile.department || 'General',
              site: 'Main Office',
              manager_id: profile.manager_id,
              status: 'Present',
              lifecycle: 'Employed',
              salary: 0,
              user_id: user.id
            });

          if (insertError) {
            console.error("Error creating employee record:", insertError);
            toast({
              title: "Error updating manager ID",
              description: insertError.message,
              variant: "destructive",
            });
            return;
          }
        }
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
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
    handleSubmit
  };
};
