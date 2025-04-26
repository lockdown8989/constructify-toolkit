import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, UserCog, Palette, Globe, BellRing, ArrowLeft, ChevronRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RegionSettings } from "@/components/settings/RegionSettings";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { LanguageSelector } from "@/components/settings/LanguageSelector";

const Settings = () => {
  const { user, isLoading } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  
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

        {/* Main settings view */}
        {activeSection === 'account' && (
          <div className="space-y-4">
            <Card className="border rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-xl font-medium flex items-center">
                  <UserCog className="mr-3 h-5 w-5 text-primary" />
                  {t('account_settings')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
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
                  onClick={() => setActiveSection('notifications')}
                >
                  <span className="flex items-center">
                    {t('notifications')}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
            
            <Card className="border rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-xl font-medium flex items-center">
                  <Palette className="mr-3 h-5 w-5 text-primary" />
                  {t('appearance')}
                </CardTitle>
              </CardHeader>
              <CardContent className="py-4">
                <ThemeSelector />
              </CardContent>
            </Card>
            
            <Card className="border rounded-xl shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 pb-4">
                <CardTitle className="text-xl font-medium flex items-center">
                  <Globe className="mr-3 h-5 w-5 text-primary" />
                  {t('region_language')}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Button 
                  variant="ghost" 
                  className="w-full justify-between py-6 rounded-none text-base font-normal"
                  onClick={() => setActiveSection('region')}
                >
                  <span className="flex items-center">
                    {t('regionCurrency')}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
                
                <Separator />
                
                <Button 
                  variant="ghost" 
                  className="w-full justify-between py-6 rounded-none text-base font-normal"
                  onClick={() => setActiveSection('language')}
                >
                  <span className="flex items-center">
                    {t('language')}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notification settings section */}
        {activeSection === 'notifications' && (
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              className="mb-4 flex items-center text-muted-foreground font-normal"
              onClick={() => setActiveSection('account')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
            
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl font-medium flex items-center">
                  <BellRing className="mr-3 h-5 w-5 text-primary" />
                  {t('notifications')}
                </CardTitle>
                <CardDescription>
                  {t('manageNotifications')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <NotificationSettings user={user} />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Region settings section */}
        {activeSection === 'region' && (
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              className="mb-4 flex items-center text-muted-foreground font-normal"
              onClick={() => setActiveSection('account')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
            
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl font-medium flex items-center">
                  <Globe className="mr-3 h-5 w-5 text-primary" />
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

        {/* Language settings section */}
        {activeSection === 'language' && (
          <div className="space-y-4">
            <Button 
              variant="ghost" 
              className="mb-4 flex items-center text-muted-foreground font-normal"
              onClick={() => setActiveSection('account')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Settings
            </Button>
            
            <Card className="border rounded-xl shadow-sm">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl font-medium flex items-center">
                  <Globe className="mr-3 h-5 w-5 text-primary" />
                  {t('language')}
                </CardTitle>
                <CardDescription>
                  {t('chooseLanguage')}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="w-full max-w-md">
                  <LanguageSelector 
                    language={user ? undefined : 'en'} 
                    onChange={() => {}} 
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
