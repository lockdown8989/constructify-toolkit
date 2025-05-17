
import { useState, useEffect, ChangeEvent } from "react";
import { User } from "@supabase/supabase-js";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/hooks/language";
import CountryInput from "@/components/settings/CountryInput";
import { LanguageSelector } from "@/components/settings/LanguageSelector";
import { detectUserLocation } from "@/services/geolocation";
import { getCountryName } from "@/utils/country-utils";
import { getUserTimezone, formatTimezoneOffset } from "@/utils/timezone-utils";
import { useAuth } from "@/hooks/use-auth";

interface RegionalPreferencesFormProps {
  user: User | null;
}

export const RegionalPreferencesForm = ({ user }: RegionalPreferencesFormProps) => {
  const { toast } = useToast();
  const { t, setLanguage } = useLanguage();
  const { userRole } = useAuth();
  const isEmployee = userRole === 'employee';
  const [isLoading, setIsLoading] = useState(true);
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [preferences, setPreferences] = useState({
    preferred_language: "en" as "en" | "es" | "bg" | "pl" | "ro",
    country: "",
    timezone: "",
    timezone_offset: 0
  });

  useEffect(() => {
    const fetchPreferences = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("preferred_language, country, timezone, timezone_offset")
          .eq("id", user.id)
          .maybeSingle();

        if (error) {
          console.error("Error fetching preferences:", error);
          return;
        }

        if (data) {
          // Get browser timezone as fallback
          const browserTimezone = getUserTimezone();
          const browserOffset = new Date().getTimezoneOffset() * -1;
          
          setPreferences({
            preferred_language: (data.preferred_language || "en") as "en" | "es" | "bg" | "pl" | "ro",
            country: data.country || "",
            timezone: data.timezone || browserTimezone,
            timezone_offset: data.timezone_offset !== null ? data.timezone_offset : browserOffset
          });
          
          // If no country or timezone is set, auto-detect location
          if (!data.country || !data.timezone) {
            autoDetectLocation();
          }
        }
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPreferences();
  }, [user]);

  const autoDetectLocation = async () => {
    if (!user || isLocating) return;
    
    setIsLocating(true);
    try {
      const { country, countryCode, timezone, timezoneOffset } = await detectUserLocation();
      
      const countryName = countryCode ? getCountryName(countryCode) : country;
      
      setPreferences((prev) => ({
        ...prev,
        country: countryName,
        timezone: timezone,
        timezone_offset: timezoneOffset
      }));
      
      toast({
        title: "Location detected",
        description: `Detected location: ${countryName}, ${timezone}`,
      });
    } catch (error) {
      console.error("Error detecting location:", error);
      toast({
        title: "Location detection failed",
        description: "Could not automatically detect your location.",
        variant: "destructive",
      });
    } finally {
      setIsLocating(false);
    }
  };

  const handleLanguageChange = (language: string) => {
    setPreferences((prev) => ({
      ...prev,
      preferred_language: language as "en" | "es" | "bg" | "pl" | "ro",
    }));
  };

  const handleCountryChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPreferences((prev) => ({
      ...prev,
      country: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          preferred_language: preferences.preferred_language,
          country: preferences.country,
          timezone: preferences.timezone,
          timezone_offset: preferences.timezone_offset,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);

      if (error) {
        toast({
          title: "Error updating preferences",
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      // Update the language in the app
      await setLanguage(preferences.preferred_language);

      toast({
        title: "Preferences updated",
        description: "Your regional preferences have been successfully updated.",
        variant: "default",
      });
    } catch (error: any) {
      console.error("Error:", error);
      toast({
        title: "An unexpected error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <CardContent className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-lg">Loading preferences...</span>
      </CardContent>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-6 p-6">
        <div>
          <h3 className="text-lg font-medium mb-3">Language</h3>
          <LanguageSelector
            language={preferences.preferred_language}
            onChange={handleLanguageChange}
          />
        </div>

        <div>
          <h3 className="text-lg font-medium mb-3">Country</h3>
          <CountryInput
            country={preferences.country}
            onChange={handleCountryChange}
            onDetect={autoDetectLocation}
            isLocating={isLocating}
          />
          {preferences.timezone && (
            <div className="text-sm text-muted-foreground mt-2">
              {preferences.timezone} ({formatTimezoneOffset(preferences.timezone_offset)})
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t bg-muted/10 p-6">
        <Button type="submit" className="ml-auto" disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {t('saving')}
            </>
          ) : (
            t('saveChanges')
          )}
        </Button>
      </CardFooter>
    </form>
  );
};
