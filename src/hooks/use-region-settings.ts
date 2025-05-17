
import { useState, ChangeEvent, FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';
import { detectUserLocation } from '@/services/geolocation';
import { User } from '@/hooks/auth/types';

interface RegionData {
  country: string;
  timezone: string;
  timezone_offset: number;
  preferred_language: string;
}

export const useRegionSettings = (user: User | null) => {
  const { toast } = useToast();
  const { isAdmin, isManager, isHR } = useAuth();
  const isEmployee = user && !isAdmin && !isManager && !isHR;
  
  const [regionData, setRegionData] = useState<RegionData>({
    country: user?.country || '',
    timezone: user?.timezone || '',
    timezone_offset: user?.timezone_offset || 0,
    preferred_language: user?.preferred_language || 'en'
  });
  
  const [isLocating, setIsLocating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setRegionData(prev => ({
      ...prev,
      country: e.target.value
    }));
  };
  
  const handleLanguageChange = (language: string) => {
    setRegionData(prev => ({
      ...prev,
      preferred_language: language
    }));
  };
  
  const autoDetectLocation = async () => {
    try {
      setIsLocating(true);
      const locationData = await detectUserLocation();
      
      setRegionData(prev => ({
        ...prev,
        country: locationData.country,
        timezone: locationData.timezone,
        timezone_offset: locationData.timezoneOffset
      }));
      
      toast({
        title: "Location detected",
        description: `Country: ${locationData.country}`,
      });
    } catch (error) {
      console.error("Error detecting location:", error);
      toast({
        title: "Location detection failed",
        description: "Could not detect your location. Please enter manually.",
        variant: "destructive"
      });
    } finally {
      setIsLocating(false);
    }
  };
  
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulated API call - in a real app this would call an API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the user's region settings
      console.log("Saving region settings:", regionData);
      
      toast({
        title: "Settings saved",
        description: "Your region settings have been updated.",
      });
    } catch (error) {
      console.error("Error saving region settings:", error);
      toast({
        title: "Error",
        description: "Failed to save region settings. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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
