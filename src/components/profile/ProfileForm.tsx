
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ManagerIdSection } from "./ManagerIdSection";
import { ManagerIdField } from "./ManagerIdField";
import { BasicInfoFields } from "./BasicInfoFields";
import { EmailField } from "./EmailField";
import { AvatarUpload } from "@/components/ui/avatar-upload";
import { useProfileForm } from "./useProfileForm";
import { useLanguage } from "@/hooks/use-language";

interface ProfileFormProps {
  user: User | null;
  isManager: boolean;
  managerId: string | null;
}

export const ProfileForm = ({ user, isManager, managerId }: ProfileFormProps) => {
  const { profile, isSaving, handleChange, handleSubmit, handleAvatarChange } = useProfileForm(user);
  const { t } = useLanguage();

  const userInitials = `${profile.first_name?.[0] || user?.email?.[0] || 'U'}${profile.last_name?.[0] || ''}`.toUpperCase();

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-6">
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

        {/* Display Manager ID prominently for managers */}
        <ManagerIdSection managerId={managerId} isManager={isManager} />
        
        <BasicInfoFields 
          firstName={profile.first_name}
          lastName={profile.last_name}
          position={profile.position}
          department={profile.department}
          onChange={handleChange}
        />
        
        <EmailField 
          user={user} 
          email={profile.email}
          onChange={handleChange}
          isEditable={true}
        />
        
        {/* Manager ID field (shown for employees or as backup for managers) */}
        <ManagerIdField 
          managerId={profile.manager_id || managerId} 
          onChange={handleChange}
          isManager={isManager}
          isEditable={!isManager}
        />
      </CardContent>
      
      <CardFooter>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? t('saving') : t('saveChanges')}
        </Button>
      </CardFooter>
    </form>
  );
};
