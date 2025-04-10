
import { useState, useEffect } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ManagerIdSection } from "./ManagerIdSection";
import { ManagerIdField } from "./ManagerIdField";
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

interface ProfileFormProps {
  user: User | null;
  isManager: boolean;
  managerId: string | null;
}

interface ProfileData {
  first_name: string;
  last_name: string;
  position: string;
  department: string;
  preferred_currency: string;
  country: string;
}

const currencyOptions = [
  { value: "USD", label: "US Dollar ($)", icon: DollarSign },
  { value: "GBP", label: "British Pound (£)", icon: PoundSterling },
  { value: "EUR", label: "Euro (€)", icon: Euro },
];

export const ProfileForm = ({ user, isManager, managerId }: ProfileFormProps) => {
  const { toast } = useToast();
  const [profile, setProfile] = useState<ProfileData>({
    first_name: "",
    last_name: "",
    position: "",
    department: "",
    preferred_currency: "USD",
    country: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        
        if (error) {
          console.error("Error fetching profile:", error);
          return;
        }
        
        if (data) {
          setProfile({
            first_name: data.first_name || "",
            last_name: data.last_name || "",
            position: data.position || "",
            department: data.department || "",
            preferred_currency: data.preferred_currency || "USD",
            country: data.country || "",
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
    
    fetchProfileData();
  }, [user]);

  const autoDetectLocation = async () => {
    setIsLocating(true);
    try {
      const { country, currencyCode } = await detectUserLocation();
      setProfile(prev => ({
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
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleCurrencyChange = (value: string) => {
    setProfile((prev) => ({ ...prev, preferred_currency: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: profile.first_name,
          last_name: profile.last_name,
          position: profile.position,
          department: profile.department,
          preferred_currency: profile.preferred_currency,
          country: profile.country,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
      
      if (error) {
        toast({
          title: "Error updating profile",
          description: error.message,
          variant: "destructive",
        });
        return;
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
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
        {/* Display Manager ID prominently for managers */}
        <ManagerIdSection managerId={managerId} isManager={isManager} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="first_name">First Name</Label>
            <Input
              id="first_name"
              name="first_name"
              value={profile.first_name}
              onChange={handleChange}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="last_name">Last Name</Label>
            <Input
              id="last_name"
              name="last_name"
              value={profile.last_name}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="position">Position</Label>
          <Input
            id="position"
            name="position"
            value={profile.position}
            onChange={handleChange}
            placeholder="e.g. Software Developer"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="department">Department</Label>
          <Input
            id="department"
            name="department"
            value={profile.department}
            onChange={handleChange}
            placeholder="e.g. Engineering"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <div className="flex">
              <Input
                id="country"
                name="country"
                value={profile.country}
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
              value={profile.preferred_currency} 
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
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user?.email || ""}
            disabled
            className="bg-gray-100"
          />
          <p className="text-xs text-gray-500">Email cannot be changed</p>
        </div>
        
        {/* Manager ID field (shown for employees or as backup for managers) */}
        <ManagerIdField managerId={managerId} isManager={isManager} />
      </CardContent>
      
      <CardFooter>
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </CardFooter>
    </form>
  );
};
