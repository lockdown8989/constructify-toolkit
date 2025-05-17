
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { detectUserLocation } from "@/services/geolocation";
import useCurrencyPreference from "@/hooks/use-currency-preference";
import { getCountryName } from "@/utils/country-utils";
import { useLanguage } from "@/hooks/use-language";
import { getUserTimezone } from "@/utils/timezone-utils";
import { useAuth } from "@/hooks/use-auth";

interface RegionData {
  country: string;
  preferred_language: string;
  timezone: string;
  timezone_offset: number;
}

export const useRegionSettings = (user: User | null) => {
  const { toast } = useToast();
  const { setLanguage } = useLanguage();
  const { userRole } = useAuth();
  const isEmployee = userRole === 'employee';
  
  const [regionData, setRegionData] = useState<RegionData>({
    country: "",
    preferred_language: "en",
    timezone: "",
    timezone_offset: 0
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const fetchRegionData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("country, preferred_language, timezone, timezone_offset")
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
          // If we haven't detected a location yet, set defaults with browser timezone
          const browserTimezone = getUserTimezone();
          const timezoneOffset = new Date().getTimezoneOffset() * -1; // Browser returns opposite sign
          
          setRegionData({
            country: data.country || "",
            preferred_language: data.preferred_language || "en",
            timezone: data.timezone || browserTimezone,
            timezone_offset: data.timezone_offset !== null ? data.timezone_offset : timezoneOffset
          });
          
          // If the country is empty or no timezone, auto-detect user's location
          if (!data.country || !data.timezone) {
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
      const { country, countryCode, timezone, timezoneOffset } = await detectUserLocation();
      
      const countryName = countryCode ? getCountryName(countryCode) : country;
      
      const { error } = await supabase
        .from("profiles")
        .update({
          country: countryName,
          timezone: timezone,
          timezone_offset: timezoneOffset,
        })
        .eq("id", user.id);

      if (error) throw error;
      
      setRegionData(prev => ({
        ...prev, 
        country: countryName,
        timezone: timezone,
        timezone_offset: timezoneOffset
      }));
      
      toast({
        title: "Location detected",
        description: `Detected country: ${countryName} (${timezone})`,
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
          preferred_language: regionData.preferred_language,
          timezone: regionData.timezone,
          timezone_offset: regionData.timezone_offset,
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
  
  const handleLanguageChange = (value: string) => {
    setRegionData((prev) => ({ ...prev, preferred_language: value }));
  };

  return {
    regionData,
    isLocating,
    isSaving,
    isEmployee,
    handleChange,
    handleLanguageChange,
    handleSubmit,
    autoDetectLocation
  };
};
