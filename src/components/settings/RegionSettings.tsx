
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import CountryInput from "./CountryInput";
import { LanguageSelector } from "./LanguageSelector";
import { useRegionSettings } from "@/hooks/use-region-settings";
import { useLanguage } from "@/hooks/use-language";
import { Card } from "@/components/ui/card";
import { MapPin, Languages } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatTimezoneOffset } from "@/utils/timezone-utils";
import { useEffect } from "react";

export const RegionSettings = () => {
  const { user } = useAuth();
  const {
    regionData,
    isLocating,
    isSaving,
    isEmployee,
    handleChange,
    handleLanguageChange,
    handleSubmit,
    autoDetectLocation
  } = useRegionSettings(user);

  const { t, setLanguage } = useLanguage();
  const { toast } = useToast();

  // Auto-detect location on component mount
  useEffect(() => {
    if (!regionData.country) {
      console.log('RegionSettings: Auto-detecting location...');
      autoDetectLocation();
    }
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('RegionSettings: Submitting form with data:', regionData);
    
    try {
      toast({
        title: "Saving changes",
        description: "Updating your region and language settings...",
      });
      
      // Save region settings first
      await handleSubmit(e);
      
      // Update the language context immediately for app-wide changes
      if (regionData.preferred_language) {
        console.log('RegionSettings: Updating language context to:', regionData.preferred_language);
        await setLanguage(regionData.preferred_language as any);
      }
      
      toast({
        title: "Settings saved successfully",
        description: "Your preferences have been updated. The page will refresh to apply language changes.",
      });
      
      // Refresh the page to ensure all components re-render with new language
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('RegionSettings: Error saving settings:', error);
      toast({
        title: "Error saving settings",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <CardContent className="space-y-6 pt-2">
        <Card className="p-4 rounded-xl bg-background/40 border shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-base font-medium pb-2">{t('location')}</div>
              <CountryInput
                country={regionData.country}
                isLocating={isLocating}
                onChange={handleChange}
                onDetect={autoDetectLocation}
              />
              {regionData.timezone && (
                <div className="text-sm text-muted-foreground mt-2">
                  {regionData.timezone} ({formatTimezoneOffset(regionData.timezone_offset)})
                </div>
              )}
            </div>
          </div>
        </Card>
        
        <Card className="p-4 rounded-xl bg-background/40 border shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Languages className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-base font-medium pb-2">{t('preferredLanguage')}</div>
              <LanguageSelector
                language={regionData.preferred_language}
                onChange={handleLanguageChange}
              />
            </div>
          </div>
        </Card>
      </CardContent>
      
      <CardFooter className="pb-6">
        <Button 
          type="submit" 
          disabled={isSaving} 
          className="w-full rounded-xl py-6"
        >
          {isSaving ? t('saving') : t('saveChanges')}
        </Button>
      </CardFooter>
    </form>
  );
};
