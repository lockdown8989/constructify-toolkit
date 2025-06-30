
import { useAuth } from "@/hooks/auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useProfileData } from "@/components/profile/useProfileData";
import { Loader2, Clock, Settings } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { user, isManager } = useAuth();
  const { profile, managerId, isLoading } = useProfileData(user, isManager);
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-lg">{t('loading')}</span>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 max-w-4xl">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('profile')}</h1>
          <p className="text-muted-foreground">
            {t('manageProfile')}
          </p>
          <Separator className="mt-4" />
        </div>
        
        <div className="space-y-6">
          <Card className="border rounded-xl shadow-sm">
            <CardHeader className="bg-muted/30">
              <CardTitle className="text-xl font-medium">{t('personalInfo')}</CardTitle>
              <CardDescription>
                {t('updatePersonalInfo')}
              </CardDescription>
            </CardHeader>
            
            <ProfileForm 
              user={user}
              isManager={isManager}
              managerId={managerId}
            />
          </Card>

          {/* Quick Actions */}
          <Card className="border rounded-xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg font-medium">Quick Actions</CardTitle>
              <CardDescription>
                Manage your profile settings and preferences
              </CardDescription>
            </CardHeader>
            <div className="p-6 pt-0 space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/profile-settings', { state: { section: 'availability' } })}
              >
                <Clock className="mr-2 h-4 w-4" />
                Set Weekly Availability
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start" 
                onClick={() => navigate('/profile-settings')}
              >
                <Settings className="mr-2 h-4 w-4" />
                More Settings
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
