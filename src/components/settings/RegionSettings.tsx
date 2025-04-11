
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { CountryInput } from "./CountryInput";
import { CurrencySelector } from "./CurrencySelector";
import { LanguageSelector } from "./LanguageSelector";
import { useRegionSettings } from "@/hooks/use-region-settings";
import { useLanguage } from "@/hooks/use-language";
import { Card } from "@/components/ui/card";
import { MapPin, Currency, Languages } from "lucide-react";

interface RegionSettingsProps {
  user: User | null;
}

export const RegionSettings = ({ user }: RegionSettingsProps) => {
  const {
    regionData,
    isLocating,
    isSaving,
    handleChange,
    handleCurrencyChange,
    handleLanguageChange,
    handleSubmit,
    autoDetectLocation
  } = useRegionSettings(user);

  const { t } = useLanguage();

  return (
    <form onSubmit={handleSubmit}>
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
            </div>
          </div>
        </Card>
        
        <Card className="p-4 rounded-xl bg-background/40 border shadow-sm">
          <div className="flex items-start space-x-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
              <Currency className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="text-base font-medium pb-2">Preferred Currency</div>
              <CurrencySelector
                currency={regionData.preferred_currency}
                onChange={handleCurrencyChange}
              />
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
