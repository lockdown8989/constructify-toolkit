
import { useAuth } from "@/hooks/auth";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { useProfileData } from "@/components/profile/useProfileData";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { useLanguage } from "@/hooks/use-language";

const Profile = () => {
  const { user, isManager } = useAuth();
  const { profile, managerId, isLoading } = useProfileData(user, isManager);
  const { t } = useLanguage();
  
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
      </div>
    </div>
  );
};

export default Profile;
