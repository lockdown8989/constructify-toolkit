
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter } from "@/components/ui/card";
import { CountryInput } from "./CountryInput";
import { CurrencySelector } from "./CurrencySelector";
import { LanguageSelector } from "./LanguageSelector";
import { useRegionSettings } from "@/hooks/use-region-settings";
import { useLanguage } from "@/hooks/use-language";

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
      <CardContent className="space-y-4">
        <CountryInput
          country={regionData.country}
          isLocating={isLocating}
          onChange={handleChange}
          onDetect={autoDetectLocation}
        />
        
        <CurrencySelector
          currency={regionData.preferred_currency}
          onChange={handleCurrencyChange}
        />
        
        <LanguageSelector
          language={regionData.preferred_language}
          onChange={handleLanguageChange}
        />
      </CardContent>
      
      <CardFooter>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? t('saving') : t('saveChanges')}
        </Button>
      </CardFooter>
    </form>
  );
};
