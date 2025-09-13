
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { UserCog, ChevronRight, User } from "lucide-react";
import { useLanguage } from "@/hooks/use-language";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import AccountTypeDisplay from "@/components/auth/AccountTypeDisplay";

export const AccountSection = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  return (
    <Card className="border rounded-xl shadow-sm overflow-hidden">
      <div className="bg-muted/30 p-6 pb-4">
        <h2 className="text-xl font-medium flex items-center">
          <UserCog className="mr-3 h-5 w-5 text-primary" />
          {t('account_settings')}
        </h2>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Account Type</span>
            <AccountTypeDisplay />
          </div>
          {user?.email && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
          )}
        </div>
      </div>
      <div className="p-0">
        <Button 
          variant="ghost" 
          className="w-full justify-between py-6 rounded-none text-base font-normal"
          onClick={() => navigate('/profile')}
        >
          <span className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Profile
          </span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Button>
        
        <Separator />
        
        <Button 
          variant="ghost" 
          className="w-full justify-between py-6 rounded-none text-base font-normal"
          onClick={() => navigate('/profile')}
        >
          <span className="flex items-center">
            {t('personalInfo')}
          </span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Button>
        
        <Separator />
        
        <Button 
          variant="ghost" 
          className="w-full justify-between py-6 rounded-none text-base font-normal"
          onClick={() => navigate('?section=notifications')}
        >
          <span className="flex items-center">
            {t('notifications')}
          </span>
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
    </Card>
  );
};
