
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { detectUserLocation } from "@/services/geolocation";
import useCurrencyPreference from "@/hooks/use-currency-preference";
import { getCountryName } from "@/utils/country-utils";
import { useLanguage } from "@/hooks/use-language";

interface RegionData {
  country: string;
  preferred_currency: string;
  preferred_language: string;
}

export const useRegionSettings = (user: User | null) => {
  const { toast } = useToast();
  const { setCurrency } = useCurrencyPreference();
  const { setLanguage, t } = useLanguage();
  
  const [regionData, setRegionData] = useState<RegionData>({
    country: "",
    preferred_currency: "USD",
    preferred_language: "en",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const fetchRegionData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("country, preferred_currency, preferred_language")
          .eq("id", user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }
        
        if (data) {
          setRegionData({
            country: data.country ? getCountryName(data.country) : "",
            preferred_currency: data.preferred_currency || "USD",
            preferred_language: data.preferred_language || "en",
          });
          
          // If the country is empty, try to detect user's location
          if (!data.country || !data.preferred_currency) {
            autoDetectLocation();
          }
        } else {
          // New user, auto-detect location
          autoDetectLocation();
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };
    
    fetchRegionData();
  }, [user]);

  const autoDetectLocation = async () => {
    setIsLocating(true);
    try {
      const { country, currencyCode } = await detectUserLocation();
      
      // Convert country code to full name if needed
      const countryName = country === "GB" ? "United Kingdom" : getCountryName(country);
      
      setRegionData(prev => ({
        ...prev, 
        country: countryName || prev.country,
        preferred_currency: currencyCode
      }));
      
      if (country) {
        toast({
          title: t('locationDetected'),
          description: `${t('detectedCountry')}: ${countryName} (${currencyCode})`,
        });
      }
    } catch (error) {
      console.error("Error auto-detecting location:", error);
    } finally {
      setIsLocating(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegionData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (value: string) => {
    setRegionData((prev) => ({ ...prev, preferred_currency: value }));
  };
  
  const handleLanguageChange = (value: string) => {
    setRegionData((prev) => ({ ...prev, preferred_language: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          country: regionData.country,
          preferred_currency: regionData.preferred_currency,
          preferred_language: regionData.preferred_language,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      
      if (error) {
        toast({
          title: t('errorUpdatingSettings'),
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      // Update the currency context
      await setCurrency(regionData.preferred_currency as 'USD' | 'GBP' | 'EUR');
      
      // Update the language context
      await setLanguage(regionData.preferred_language as any);
      
      toast({
        title: t('settingsUpdated'),
        description: t('regionSettingsUpdated'),
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: t('unexpectedError'),
        description: t('tryAgainLater'),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return {
    regionData,
    isLocating,
    isSaving,
    handleChange,
    handleCurrencyChange,
    handleLanguageChange,
    handleSubmit,
    autoDetectLocation
  };
};
