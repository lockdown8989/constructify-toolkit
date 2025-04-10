
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CardContent, CardFooter } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { DollarSign, Euro, PoundSterling } from "lucide-react";
import { detectUserLocation } from "@/services/geolocation";
import useCurrencyPreference from "@/hooks/use-currency-preference";

interface RegionSettingsProps {
  user: User | null;
}

interface RegionData {
  country: string;
  preferred_currency: string;
}

const currencyOptions = [
  { value: "USD", label: "US Dollar ($)", icon: DollarSign },
  { value: "GBP", label: "British Pound (£)", icon: PoundSterling },
  { value: "EUR", label: "Euro (€)", icon: Euro },
];

export const RegionSettings = ({ user }: RegionSettingsProps) => {
  const { toast } = useToast();
  const { setCurrency } = useCurrencyPreference();
  
  const [regionData, setRegionData] = useState<RegionData>({
    country: "",
    preferred_currency: "USD",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const fetchRegionData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("country, preferred_currency")
          .eq("id", user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }
        
        if (data) {
          setRegionData({
            country: data.country || "",
            preferred_currency: data.preferred_currency || "USD",
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
      setRegionData(prev => ({
        ...prev, 
        country: country || prev.country,
        preferred_currency: currencyCode
      }));
      
      if (country) {
        toast({
          title: "Location detected",
          description: `Detected country: ${country} (${currencyCode})`,
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
      
      toast({
        title: "Settings updated",
        description: "Your region settings have been successfully updated.",
      });
    } catch (error) {
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

  return (
    <form onSubmit={handleSubmit}>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <div className="flex">
            <Input
              id="country"
              name="country"
              value={regionData.country}
              onChange={handleChange}
              placeholder={isLocating ? "Detecting location..." : "e.g. United States"}
              className="flex-1"
            />
            <Button 
              type="button" 
              variant="outline" 
              className="ml-2" 
              onClick={autoDetectLocation}
              disabled={isLocating}
            >
              Detect
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="currency">Preferred Currency</Label>
          <Select 
            value={regionData.preferred_currency} 
            onValueChange={handleCurrencyChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {currencyOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-2" />
                      <span>{option.label}</span>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      
      <CardFooter>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </form>
  );
};
