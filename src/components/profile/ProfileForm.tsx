
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { ManagerIdSection } from "./ManagerIdSection";
import { ManagerIdField } from "./ManagerIdField";
import { BasicInfoFields } from "./BasicInfoFields";
import { EmailField } from "./EmailField";
import { useProfileForm } from "./useProfileForm";
import { useLanguage } from "@/hooks/use-language";

interface ProfileFormProps {
  user: User | null;
  isManager: boolean;
  managerId: string | null;
}

export const ProfileForm = ({ user, isManager, managerId }: ProfileFormProps) => {
  const { profile, isSaving, handleChange, handleSubmit } = useProfileForm(user);
  const { t } = useLanguage();

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        {/* Display Manager ID prominently for managers */}
        <ManagerIdSection managerId={managerId} isManager={isManager} />
        
        <BasicInfoFields 
          firstName={profile.first_name}
          lastName={profile.last_name}
          position={profile.position}
          department={profile.department}
          onChange={handleChange}
        />
        
        <EmailField user={user} />
        
        {/* Manager ID field (shown for employees or as backup for managers) */}
        <ManagerIdField managerId={managerId} isManager={isManager} />
      </CardContent>
      
      <CardFooter>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? t('saving') : t('saveChanges')}
        </Button>
      </CardFooter>
    </form>
  );
};
