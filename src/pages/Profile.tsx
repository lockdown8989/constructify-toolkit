
import { useAuth } from "@/hooks/use-auth";
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
    <div className="container mx-auto py-20 pt-24 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t('profile')}</h1>
          <p className="text-muted-foreground">
            {t('manageProfile')}
          </p>
          <Separator className="mt-4" />
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('personalInfo')}</CardTitle>
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
