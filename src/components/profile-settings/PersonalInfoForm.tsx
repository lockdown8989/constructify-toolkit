
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Mail, User as UserIcon, Save, CheckCircle2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/use-language";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { ManagerIdField } from "@/components/profile/ManagerIdField";
import { AdminIdGenerator } from "@/components/profile/AdminIdGenerator";

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
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

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

        const userIsManager = roleData?.role === 'admin' || roleData?.role === 'hr' || employeeData?.role === 'manager';
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
    
    // Listen for Administrator ID updates
    const handleAdminIdUpdate = (event: CustomEvent) => {
      const { newManagerId } = event.detail;
      setProfile(prev => ({ ...prev, manager_id: newManagerId }));
      setHasUnsavedChanges(false);
    };
    
    window.addEventListener('adminIdUpdated', handleAdminIdUpdate as EventListener);
    
    return () => {
      window.removeEventListener('adminIdUpdated', handleAdminIdUpdate as EventListener);
    };
  }, [user, toast]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!profile.first_name.trim()) {
      errors.first_name = "First name is required";
    }
    if (!profile.last_name.trim()) {
      errors.last_name = "Last name is required";
    }
    if (profile.first_name.trim().length < 2) {
      errors.first_name = "First name must be at least 2 characters";
    }
    if (profile.last_name.trim().length < 2) {
      errors.last_name = "Last name must be at least 2 characters";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
    
    // Clear field-specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleAvatarChange = (url: string | null) => {
    setProfile((prev) => ({ ...prev, avatar_url: url }));
    setHasUnsavedChanges(true);
    setSaveSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validate form before submission
    if (!validateForm()) {
      toast({
        title: "Please fix the errors below",
        description: "Some required fields are missing or invalid.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // Update profile data
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          position: profile.position,
          department: profile.department,
          avatar_url: profile.avatar_url,
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

      // Update or create employee data
      const { data: existingEmployee } = await supabase
        .from("employees")
        .select("id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingEmployee) {
        // Update existing employee record
        const updateData: any = {};
        if (profile.manager_id !== null) {
          updateData.manager_id = profile.manager_id;
        }
        if (profile.first_name && profile.last_name) {
          updateData.name = `${profile.first_name} ${profile.last_name}`.trim();
        }
        if (profile.position) {
          updateData.job_title = profile.position;
        }
        if (profile.department) {
          updateData.department = profile.department;
        }

        if (Object.keys(updateData).length > 0) {
          const { error: employeeError } = await supabase
            .from("employees")
            .update(updateData)
            .eq("user_id", user.id);

          if (employeeError) {
            console.error("Error updating employee data:", employeeError);
          }
        }
      } else {
        // Create new employee record if one doesn't exist
        const { error: employeeError } = await supabase
          .from("employees")
          .insert({
            user_id: user.id,
            name: `${profile.first_name} ${profile.last_name}`.trim() || user.email?.split('@')[0] || 'User',
            job_title: profile.position || 'Employee',
            department: profile.department || 'General',
            site: 'Main Office',
            manager_id: profile.manager_id,
            status: 'Active',
            lifecycle: 'Active',
            salary: 0,
          });

        if (employeeError) {
          console.error("Error creating employee record:", employeeError);
        }
      }

      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      toast({
        title: "Profile updated successfully",
        description: "Your personal information has been saved.",
        variant: "default",
      });
      
      // Hide success state after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
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
            <Label htmlFor="first_name" className="text-sm font-medium">
              First Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="first_name"
                name="first_name"
                value={profile.first_name}
                onChange={handleChange}
                className={`pl-10 ${formErrors.first_name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                placeholder="Enter your first name"
                disabled={isSaving}
              />
            </div>
            {formErrors.first_name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.first_name}
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last_name" className="text-sm font-medium">
              Last Name <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="last_name"
                name="last_name"
                value={profile.last_name}
                onChange={handleChange}
                className={`pl-10 ${formErrors.last_name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                placeholder="Enter your last name"
                disabled={isSaving}
              />
            </div>
            {formErrors.last_name && (
              <p className="text-sm text-destructive flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {formErrors.last_name}
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium">Email Address</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              value={user?.email || ""}
              disabled
              className="bg-muted/50 pl-10 text-muted-foreground"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This email is associated with your account and cannot be changed
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="position" className="text-sm font-medium">Position</Label>
            <Input
              id="position"
              name="position"
              value={profile.position}
              onChange={handleChange}
              placeholder="e.g. Software Developer"
              disabled={isSaving}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="department" className="text-sm font-medium">Department</Label>
            <Input
              id="department"
              name="department"
              value={profile.department}
              onChange={handleChange}
              placeholder="e.g. Engineering"
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Manager ID Field */}
        <ManagerIdField 
          managerId={profile.manager_id} 
          onChange={handleChange}
          isManager={isManager}
          isEditable={!isManager}
        />

        {/* Manager ID Generation Section for administrators without ID */}
        {isManager && !profile.manager_id && (
          <>
            <Separator />
            <AdminIdGenerator 
              managerId={profile.manager_id} 
              isManager={isManager}
              onIdGenerated={(newId) => {
                setProfile(prev => ({ ...prev, manager_id: newId }));
                setHasUnsavedChanges(false);
              }}
            />
          </>
        )}
      </CardContent>
      
      <CardFooter className="border-t bg-muted/30 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between w-full gap-4">
          <div className="flex flex-col gap-1">
            {hasUnsavedChanges && (
              <span className="text-sm text-warning font-medium flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                You have unsaved changes
              </span>
            )}
            {saveSuccess && (
              <span className="text-sm text-success font-medium flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Changes saved successfully
              </span>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full sm:w-auto min-w-[120px]"
            disabled={isSaving || !hasUnsavedChanges}
            variant={hasUnsavedChanges ? "default" : "secondary"}
            size="lg"
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Saved
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {hasUnsavedChanges ? 'Save Changes' : 'No Changes'}
              </>
            )}
          </Button>
        </div>
      </CardFooter>
    </form>
  );
};
