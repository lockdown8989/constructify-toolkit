
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, User as UserIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { ManagerIdField } from "@/components/profile/ManagerIdField";

interface PersonalInfoFormProps {
  user: User | null;
}

export const PersonalInfoForm = ({ user }: PersonalInfoFormProps) => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [profile, setProfile] = useState({
    first_name: "",
    last_name: "",
    position: "",
    department: "",
    avatar_url: null as string | null,
    manager_id: null as string | null,
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch profile data
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("first_name, last_name, position, department, avatar_url")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
          toast({
            title: "Error loading profile",
            description: profileError.message,
            variant: "destructive",
          });
          return;
        }

        // Fetch employee data for manager_id and role
        const { data: employeeData, error: employeeError } = await supabase
          .from("employees")
          .select("manager_id, role")
          .eq("user_id", user.id)
          .maybeSingle();

        if (employeeError && employeeError.code !== 'PGRST116') {
          console.error("Error fetching employee data:", employeeError);
        }

        // Check if user is a manager
        const { data: roleData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .maybeSingle();

        const userIsManager = roleData?.role === 'employer' || roleData?.role === 'admin' || roleData?.role === 'hr' || employeeData?.role === 'manager';
        setIsManager(userIsManager);

        if (profileData) {
          setProfile({
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            position: profileData.position || "",
            department: profileData.department || "",
            avatar_url: profileData.avatar_url || null,
            manager_id: employeeData?.manager_id || null,
          });
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfileData();
  }, [user, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (url: string | null) => {
    setProfile((prev) => ({ ...prev, avatar_url: url }));
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

      // Update employee data if manager_id changed (including when set to empty string or null)
      if (!isManager) {
        // Validate manager ID format if provided
        if (profile.manager_id && profile.manager_id.trim() !== "") {
          const managerIdPattern = /^MGR-\d{5}$/;
          if (!managerIdPattern.test(profile.manager_id.trim())) {
            toast({
              title: "Invalid Manager ID",
              description: "Manager ID must be in format MGR-12345",
              variant: "destructive",
            });
            return;
          }

          // Verify manager exists
          const { data: managerExists, error: managerCheckError } = await supabase
            .from("employees")
            .select("id, name")
            .eq("manager_id", profile.manager_id.trim())
            .maybeSingle();

          if (managerCheckError) {
            console.error("Error validating manager:", managerCheckError);
            toast({
              title: "Error validating manager",
              description: "Failed to verify manager ID",
              variant: "destructive",
            });
            return;
          }

          if (!managerExists) {
            toast({
              title: "Manager not found",
              description: "No manager found with that ID. Please check and try again.",
              variant: "destructive",
            });
            return;
          }
        }

        const { error: employeeError } = await supabase
          .from("employees")
          .update({
            manager_id: profile.manager_id?.trim() || null,
          })
          .eq("user_id", user.id);

        if (employeeError) {
          console.error("Error updating employee manager_id:", employeeError);
          toast({
            title: "Error connecting to manager",
            description: employeeError.message,
            variant: "destructive",
          });
          return;
        }
      }

      let successMessage = "Your profile has been successfully updated.";
      if (!isManager && profile.manager_id?.trim()) {
        successMessage = "Profile updated and successfully connected to manager!";
      } else if (!isManager && (!profile.manager_id || profile.manager_id.trim() === "")) {
        successMessage = "Profile updated and disconnected from manager.";
      }

      toast({
        title: "Profile updated",
        description: successMessage,
        variant: "default",
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

  if (isLoading) {
    return (
      <CardContent className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-lg">Loading profile data...</span>
      </CardContent>
    );
  }

  const userInitials = `${profile.first_name?.[0] || user?.email?.[0] || 'U'}${profile.last_name?.[0] || ''}`.toUpperCase();

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-6 p-6">
        {/* Avatar Upload Section */}
        <div className="flex flex-col items-center space-y-4">
          <h3 className="text-lg font-medium">Profile Picture</h3>
          <AvatarUpload
            currentAvatarUrl={profile.avatar_url}
            onAvatarChange={handleAvatarChange}
            userInitials={userInitials}
            size="lg"
            disabled={isSaving}
          />
        </div>

        <Separator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="first_name"
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                id="last_name"
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
                className="pl-10"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-gray-50 pl-10"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This email is associated with your account and cannot be changed
          </p>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            name="position"
            value={profile.position}
            onChange={handleChange}
            placeholder="e.g. Software Developer"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            value={profile.department}
            onChange={handleChange}
            placeholder="e.g. Engineering"
          />
        </div>

        {/* Manager ID Field */}
        <ManagerIdField 
          managerId={profile.manager_id} 
          onChange={handleChange}
          isManager={isManager}
          isEditable={!isManager}
        />
      </CardContent>
      
      <CardFooter className="border-t bg-muted/10 p-6">
        <Button type="submit" className="ml-auto" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            t('saveChanges')
          )}
        </Button>
      </CardFooter>
    </form>
  );
};
