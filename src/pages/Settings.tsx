
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
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
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
          <h1 className="text-3xl font-semibold mb-2">{t('profileSettings')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('manageSettings')}
          </p>
          <Separator className="mt-4" />
        </div>

        <div className="space-y-4">
          <Card className="border rounded-xl shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4">
              <CardTitle className="text-xl font-medium flex items-center">
                <UserCog className="mr-3 h-5 w-5 text-primary" />
                {t('account')}
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
                onClick={() => {
                  navigate('/settings', { state: { section: 'notifications' } });
                }}
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
                {t('regionLanguage')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Button 
                variant="ghost" 
                className="w-full justify-between py-6 rounded-none text-base font-normal"
                onClick={() => {
                  navigate('/settings', { state: { section: 'region' } });
                }}
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
                onClick={() => {
                  navigate('/settings', { state: { section: 'language' } });
                }}
              >
                <span className="flex items-center">
                  {t('language')}
                </span>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
