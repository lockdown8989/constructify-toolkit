
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy } from "lucide-react";

interface ProfileData {
  first_name: string;
  last_name: string;
  position: string;
  department: string;
}

const Profile = () => {
  const { user, isManager } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    position: "",
    department: "",
  });
  const [managerId, setManagerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        
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
        
        // Fetch manager ID if the user is a manager
        if (isManager) {
          const { data: employeeData, error: employeeError } = await supabase
            .from("employees")
            .select("manager_id")
            .eq("user_id", user.id)
            .eq("job_title", "Manager")
            .single();
            
          if (employeeError) {
            console.error("Error fetching manager ID:", employeeError);
          } else if (employeeData) {
            setManagerId(employeeData.manager_id);
          }
        } else {
          // Fetch manager ID for employee to display their manager's ID
          const { data: employeeData, error: employeeError } = await supabase
            .from("employees")
            .select("manager_id")
            .eq("user_id", user.id)
            .single();
            
          if (!employeeError && employeeData) {
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
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          position: profile.position,
          department: profile.department,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      
      if (error) {
        toast({
          title: "Error updating profile",
          description: error.message,
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
  
  const copyManagerId = () => {
    if (managerId) {
      navigator.clipboard.writeText(managerId);
      toast({
        title: "Manager ID copied",
        description: "Manager ID has been copied to clipboard",
      });
    }
  };
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  return (
    <div className="container mx-auto py-20 pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Profile</h1>
        
        <Card>
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
              
              {managerId && (
                <div className="space-y-2">
                  <Label htmlFor="manager_id">
                    {isManager ? "Your Manager ID" : "Your Manager's ID"}
                  </Label>
                  <div className="flex">
                    <Input
                      id="manager_id"
                      value={managerId}
                      disabled
                      className="bg-gray-100"
                    />
                    {isManager && (
                      <Button 
                        type="button" 
                        variant="outline" 
                        className="ml-2" 
                        onClick={copyManagerId}
                        title="Copy Manager ID"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  {isManager ? (
                    <p className="text-xs text-gray-500">Share this ID with your employees to connect them to your account</p>
                  ) : (
                    <p className="text-xs text-gray-500">This is the ID of your manager's account</p>
                  )}
                </div>
              )}
            </CardContent>
            
            <CardFooter>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
