
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Languages, Moon, BellRing } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { RegionSettings } from "@/components/settings/RegionSettings";
import { ThemeSelector } from "@/components/settings/ThemeSelector";
import { NotificationSettings } from "@/components/settings/NotificationSettings";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLanguage } from "@/hooks/use-language";
import { languageOptions } from "@/utils/translations";

const Settings = () => {
  const { user, isLoading } = useAuth();
  const { language, setLanguage, t } = useLanguage();
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-lg font-medium">{t('loading')}</span>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen py-12 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-1">{t('settings')}</h1>
          <p className="text-muted-foreground text-sm">
            {t('manageSettings')}
          </p>
          <Separator className="mt-4" />
        </div>

        <Tabs defaultValue="region" className="w-full">
          <TabsList className="mb-6 w-full grid grid-cols-4 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
            <TabsTrigger value="region" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
              <div className="flex flex-col items-center">
                <MapPin className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{t('regionCurrency')}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
              <div className="flex flex-col items-center">
                <Moon className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{t('appearance')}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="language" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
              <div className="flex flex-col items-center">
                <Languages className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{t('language')}</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="rounded-lg py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm">
              <div className="flex flex-col items-center">
                <BellRing className="h-5 w-5 mb-1" />
                <span className="text-xs font-medium">{t('notifications')}</span>
              </div>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="region">
            <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{t('regionCurrency')}</CardTitle>
                <CardDescription className="text-sm">
                  {t('configureLocation')}
                </CardDescription>
              </CardHeader>
              
              <RegionSettings user={user} />
            </Card>
          </TabsContent>
          
          <TabsContent value="appearance">
            <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{t('appearance')}</CardTitle>
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
            <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{t('language')}</CardTitle>
                <CardDescription className="text-sm">
                  {t('chooseLanguage')}
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {languageOptions.map((option) => (
                    <div 
                      key={option.value}
                      onClick={() => setLanguage(option.value as any)}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                        language === option.value 
                          ? "bg-blue-50 dark:bg-blue-900/20" 
                          : "hover:bg-gray-50 dark:hover:bg-slate-700"
                      }`}
                    >
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          language === option.value 
                            ? "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400" 
                            : "bg-gray-100 dark:bg-slate-700"
                        }`}>
                          <Languages className="h-4 w-4" />
                        </div>
                        <span className="ml-3 font-medium">{option.label}</span>
                      </div>
                      
                      {language === option.value && (
                        <div className="h-3 w-3 rounded-full bg-blue-500 dark:bg-blue-400"></div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="notifications">
            <Card className="border-none shadow-sm rounded-2xl bg-white dark:bg-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">{t('notifications')}</CardTitle>
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

export default Settings;
