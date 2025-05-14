
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { RegionSettings } from "@/components/settings/RegionSettings";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { AccountSection } from "@/components/settings/sections/AccountSection";
import { AppearanceSection } from "@/components/settings/sections/AppearanceSection";
import { LocalizationSection } from "@/components/settings/sections/LocalizationSection";
import { SettingsBackButton } from "@/components/settings/sections/SettingsBackButton";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Get section from location state or URL parameter
  const getInitialSection = () => {
    if (location.state?.section) {
      return location.state.section;
    }
    const params = new URLSearchParams(location.search);
    return params.get('section') || 'account';
  };
  
  const [activeSection, setActiveSection] = useState(getInitialSection());
  
  // Update the URL when the section changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set('section', activeSection);
    navigate(`/settings?${searchParams.toString()}`, { replace: true });
  }, [activeSection, navigate, location.search]);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-lg">{t('loading')}</span>
      </div>
    );
  }
  
  return (
    <div className="relative container mx-auto py-12 px-4 md:py-20 md:pt-24 max-w-3xl">
      <Button 
        variant="ghost" 
        size="icon" 
        className="absolute top-4 left-4 md:hidden" 
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="h-5 w-5" />
        <span className="sr-only">Back</span>
      </Button>
      
      <div className="max-w-2xl mx-auto pt-10 md:pt-0">
        <div className="mb-8 text-center md:text-left">
          <h1 className="text-3xl font-semibold mb-2">{t('profile_settings')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('manageSettings')}
          </p>
          <Separator className="mt-4" />
        </div>

        {activeSection === 'account' && (
          <div className="space-y-4">
            <AccountSection />
            <AppearanceSection />
            <LocalizationSection />
          </div>
        )}

        {activeSection === 'notifications' && (
          <div className="space-y-4">
            <SettingsBackButton onClick={() => setActiveSection('account')} />
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl font-medium">
                  {t('notifications')}
                </CardTitle>
                <CardDescription>
                  {t('manageNotifications')}
                </CardDescription>
              </CardHeader>
              <NotificationSettings />
            </Card>
          </div>
        )}

        {activeSection === 'region' && (
          <div className="space-y-4">
            <SettingsBackButton onClick={() => setActiveSection('account')} />
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl font-medium">
                  {t('regionCurrency')}
                </CardTitle>
                <CardDescription>
                  {t('configureLocation')}
                </CardDescription>
              </CardHeader>
              <RegionSettings />
            </Card>
          </div>
        )}

        {activeSection === 'language' && (
          <div className="space-y-4">
            <SettingsBackButton onClick={() => setActiveSection('account')} />
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl font-medium">
                  {t('language')}
                </CardTitle>
                <CardDescription>
                  {t('chooseLanguage')}
                </CardDescription>
              </CardHeader>
              <div className="p-6">
                <div className="w-full max-w-md">
                  <LanguageSelector 
                    language={user ? undefined : 'en'} 
                    onChange={() => {}} 
                  />
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
