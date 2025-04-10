
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Languages, Moon, BellRing } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RegionSettings } from "@/components/settings/RegionSettings";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { useLanguage } from "@/hooks/use-language";

const Settings = () => {
  const { user, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
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
          <h1 className="text-3xl font-bold mb-2">{t('settings')}</h1>
          <p className="text-muted-foreground">
            {t('manageSettings')}
          </p>
          <Separator className="mt-4" />
        </div>

        <Tabs defaultValue="region" className="w-full">
          <TabsList className="mb-4 w-full justify-start overflow-x-auto">
            <TabsTrigger value="region" className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{t('regionCurrency').split('&')[0]} & {t('regionCurrency').split('&')[1]}</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center">
              <Moon className="mr-2 h-4 w-4" />
              <span>{t('appearance').split(' ')[0]}</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center">
              <Languages className="mr-2 h-4 w-4" />
              <span>{t('language').split(' ')[0]}</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center">
              <BellRing className="mr-2 h-4 w-4" />
              <span>{t('notifications').split(' ')[0]}</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="region">
            <Card>
              <CardHeader>
                <CardTitle>{t('regionCurrency')}</CardTitle>
                <CardDescription>
                  {t('configureLocation')}
                </CardDescription>
              </CardHeader>
              
              <RegionSettings user={user} />
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card>
              <CardHeader>
                <CardTitle>{t('appearance')}</CardTitle>
                <CardDescription>
                  {t('customizeAppearance')}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ThemeSelector />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="language">
            <Card>
              <CardHeader>
                <CardTitle>{t('language')}</CardTitle>
                <CardDescription>
                  {t('chooseLanguage')}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <LanguageSelector 
                  language={language}
                  onChange={(value) => setLanguage(value as any)}
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card>
              <CardHeader>
                <CardTitle>{t('notifications')}</CardTitle>
                <CardDescription>
                  {t('manageNotifications')}
                </CardDescription>
              </CardHeader>
              
              <NotificationSettings />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;
