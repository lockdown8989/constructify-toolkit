
import { useState, ChangeEvent, FormEvent } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/auth';
import { detectUserLocation } from '@/services/geolocation';
import { supabase } from '@/integrations/supabase/client';

interface RegionData {
  country: string;
  timezone: string;
  timezone_offset: number;
  preferred_language: string;
}

export const useRegionSettings = (user: any | null) => {
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
    console.log('Language change in hook:', language);
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
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      console.log('Saving region settings:', regionData);
      
      // Update the user's profile with region and language settings
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          country: regionData.country,
          timezone: regionData.timezone,
          timezone_offset: regionData.timezone_offset,
          preferred_language: regionData.preferred_language,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) {
        console.error('Profile update error:', profileError);
        throw profileError;
      }

      // Also update the employees table if the user is an employee
      const { error: employeeError } = await supabase
        .from('employees')
        .update({
          country: regionData.country,
          timezone: regionData.timezone,
          preferred_language: regionData.preferred_language
        })
        .eq('user_id', user.id);

      // Don't throw error if employee record doesn't exist
      if (employeeError && !employeeError.message.includes('No rows found')) {
        console.warn('Employee update warning:', employeeError);
      }

      toast({
        title: "Settings saved",
        description: "Your region and language settings have been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error saving region settings:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to save region settings. Please try again.",
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
