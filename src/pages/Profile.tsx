
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useProfileData } from "@/components/profile/useProfileData";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { user, isManager } = useAuth();
  const { profile, managerId, isLoading } = useProfileData(user, isManager);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-lg">Loading your profile...</span>
      </div>
    );
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
          
          <ProfileForm 
            user={user}
            isManager={isManager}
            managerId={managerId}
          />
        </Card>
      </div>
    </div>
  );
};

export default Profile;
