
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ProfileData {
  first_name: string;
  last_name: string;
  position: string;
  department: string;
}

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    position: "",
    department: "",
  });
  const [managerId, setManagerId] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchProfileAndEmployeeData = async () => {
      if (!user) return;
      
      try {
        // Fetch user profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
        if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else if (profileData) {
          setProfile({
            first_name: profileData.first_name || "",
            last_name: profileData.last_name || "",
            position: profileData.position || "",
            department: profileData.department || "",
          });
        }
        
        // Fetch employee data including manager ID and role information
        const { data: employeeData, error: employeeError } = await supabase
          .from("employees")
          .select("*")
          .eq("user_id", user.id)
          .single();
        
        if (employeeError) {
          console.error("Error fetching employee data:", employeeError);
        } else if (employeeData) {
          setManagerId(employeeData.manager_id);
          setIsManager(employeeData.job_title === 'Manager');
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileAndEmployeeData();
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
      // Update profile information
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
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto py-20 pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                    id="first_name"
                    name="first_name"
                    value={profile.first_name}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                    id="last_name"
                    name="last_name"
                    value={profile.last_name}
                    onChange={handleChange}
                  />
                </div>
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
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  value={user?.email || ""}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">Email cannot be changed</p>
              </div>
            </CardContent>
            
            <CardFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        {/* Manager ID Card */}
        <Card>
          <CardHeader>
            <CardTitle>Manager ID Information</CardTitle>
            <CardDescription>Your connection to the organization</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="manager_id">
                {isManager ? "Your Manager ID" : "Your Manager's ID"}
              </Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="manager_id"
                  value={managerId || ""}
                  readOnly
                  className="bg-gray-100 font-mono"
                />
                {isManager && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      if (managerId) {
                        navigator.clipboard.writeText(managerId);
                        toast({
                          title: "Copied!",
                          description: "Manager ID copied to clipboard",
                        });
                      }
                    }}
                    disabled={!managerId}
                  >
                    Copy
                  </Button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                {isManager 
                  ? "Share this ID with your employees so they can connect to your account" 
                  : "This ID connects you to your manager's dashboard"}
              </p>
            </div>
            
            {isManager && (
              <div className="mt-4 p-4 bg-blue-50 rounded-md">
                <h4 className="font-medium text-blue-700">Manager ID Instructions</h4>
                <p className="text-sm text-blue-600 mt-1">
                  Your Manager ID is automatically generated when you sign up as a manager. 
                  Share this ID with your employees so they can connect to your dashboard
                  during their registration process.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
