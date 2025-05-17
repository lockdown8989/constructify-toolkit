
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

  const { t } = useLanguage();
  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    toast({
      title: "Saving changes",
      description: "Updating your region and language settings...",
    });
    
    await handleSubmit(e);
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
              <div className="text-base font-medium pb-2">Location</div>
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
              <div className="text-base font-medium pb-2">Preferred Language</div>
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
