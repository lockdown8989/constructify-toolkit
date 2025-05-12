
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
  const { setLanguage } = useLanguage();
  
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
          toast({
            title: "Error fetching profile",
            description: error.message,
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          setRegionData({
            country: data.country || "",
            preferred_currency: data.preferred_currency || "USD",
            preferred_language: data.preferred_language || "en",
          });
          
          // If the country is empty, try to detect user's location
          if (!data.country) {
            autoDetectLocation();
          }
        }
      } catch (error: any) {
        console.error("Error:", error);
        toast({
          title: "An unexpected error occurred",
          description: error.message || "Could not fetch your profile data",
          variant: "destructive",
        });
      }
    };
    
    fetchRegionData();
  }, [user, toast]);

  const autoDetectLocation = async () => {
    if (isLocating || !user) return;
    
    setIsLocating(true);
    try {
      const { country, currencyCode } = await detectUserLocation();
      
      const countryName = getCountryName(country);
      
      const { error } = await supabase
        .from("profiles")
        .update({
          country: countryName,
          preferred_currency: currencyCode || "USD"
        })
        .eq("id", user.id);

      if (error) throw error;
      
      setRegionData(prev => ({
        ...prev, 
        country: countryName,
        preferred_currency: currencyCode || prev.preferred_currency
      }));
      
      toast({
        title: "Location detected",
        description: `Detected country: ${countryName} (${currencyCode})`,
      });
    } catch (error: any) {
      console.error("Error auto-detecting location:", error);
      toast({
        title: "Location detection failed",
        description: error.message || "Could not detect your location",
        variant: "destructive",
      });
    } finally {
      setIsLocating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to update settings",
        variant: "destructive",
      });
      return;
    }
    
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
          title: "Error updating settings",
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
        title: "Settings updated",
        description: "Your region and language settings have been successfully updated.",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "An unexpected error occurred",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
