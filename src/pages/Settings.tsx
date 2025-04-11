
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Languages, Moon, BellRing, ArrowLeft } from "lucide-react";
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
    <div className="relative container mx-auto py-12 px-4 md:py-20 md:pt-24 max-w-4xl">
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
          <h1 className="text-3xl font-medium mb-2">{t('settings')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('manageSettings')}
          </p>
          <Separator className="mt-4" />
        </div>

        <Tabs defaultValue="region" className="w-full">
          <TabsList className="mb-6 w-full md:w-auto grid grid-cols-4 gap-1 bg-background/90 backdrop-blur-sm p-1 rounded-xl">
            <TabsTrigger value="region" className="flex items-center justify-center text-xs md:text-sm rounded-lg py-2">
              <MapPin className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{t('regionCurrency')}</span>
              <span className="inline md:hidden">Region</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center justify-center text-xs md:text-sm rounded-lg py-2">
              <Moon className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{t('appearance')}</span>
              <span className="inline md:hidden">Theme</span>
            </TabsTrigger>
            <TabsTrigger value="language" className="flex items-center justify-center text-xs md:text-sm rounded-lg py-2">
              <Languages className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{t('language')}</span>
              <span className="inline md:hidden">Lang</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center justify-center text-xs md:text-sm rounded-lg py-2">
              <BellRing className="mr-2 h-4 w-4" />
              <span className="hidden md:inline">{t('notifications')}</span>
              <span className="inline md:hidden">Alerts</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="region">
            <Card className="border rounded-2xl shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-medium">{t('regionCurrency')}</CardTitle>
                <CardDescription className="text-sm">
                  {t('configureLocation')}
                </CardDescription>
              </CardHeader>
              
              <RegionSettings user={user} />
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card className="border rounded-2xl shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-medium">{t('appearance')}</CardTitle>
                <CardDescription className="text-sm">
                  {t('customizeAppearance')}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <ThemeSelector />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="language">
            <Card className="border rounded-2xl shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-medium">{t('language')}</CardTitle>
                <CardDescription className="text-sm">
                  {t('chooseLanguage')}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2 mt-2">
                    {languageOptions.map((option) => (
                      <Button 
                        key={option.value}
                        variant={language === option.value ? "default" : "outline"} 
                        onClick={() => setLanguage(option.value as any)}
                        className="px-4 py-2 rounded-full"
                        size="sm"
                      >
                        {option.label}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="border rounded-2xl shadow-sm bg-card/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-xl font-medium">{t('notifications')}</CardTitle>
                <CardDescription className="text-sm">
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

// Language options from use-language.tsx
const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'bg', label: 'Български' },
  { value: 'pl', label: 'Polski' },
  { value: 'ro', label: 'Română' }
];

export default Settings;
