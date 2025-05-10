
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CountryInput } from './CountryInput';
import { LanguageSelector } from './LanguageSelector';
import { CurrencySelector } from './CurrencySelector';
import { useRegionSettings } from '@/hooks/use-region-settings';
import { useToast } from '@/hooks/use-toast';

export const RegionSettings: React.FC = () => {
  const { country, setCountry, language, setLanguage, currency, isLoading } = useRegionSettings();
  const { toast } = useToast();
  
  const handleCountryChange = async (value: string) => {
    await setCountry(value);
    toast({
      title: "Country Updated",
      description: "Your country settings have been updated.",
    });
  };
  
  const handleCurrencyChange = async (value: string) => {
    const { updateCurrencyPreference } = useCurrencyPreference();
    await updateCurrencyPreference(value);
  };
  
  const handleDetectLocation = async () => {
    // Location detection would be implemented here
    toast({
      title: "Location Detection",
      description: "This feature will detect your location automatically.",
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regional Settings</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Country</label>
          <CountryInput 
            country={country} 
            isLocating={false} 
            onChange={(e) => handleCountryChange(e.target.value)} 
            onDetect={handleDetectLocation} 
          />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Language</label>
          <LanguageSelector />
        </div>
        
        <div>
          <label className="text-sm font-medium mb-2 block">Currency</label>
          <CurrencySelector currency={currency} onChange={handleCurrencyChange} />
        </div>
      </CardContent>
    </Card>
  );
};

// Add missing hook import
import { useCurrencyPreference } from '@/hooks/use-currency-preference';
