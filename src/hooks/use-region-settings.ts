
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import { useCurrencyPreference } from '@/hooks/use-currency-preference';

export const useRegionSettings = () => {
  const { user } = useAuth();
  const { currency, setCurrency } = useCurrencyPreference();
  const [country, setCountryState] = useState<string>('US');
  const [language, setLanguageState] = useState<string>('en');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchRegionSettings = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('country, preferred_language')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data) {
          if (data.country) setCountryState(data.country);
          if (data.preferred_language) setLanguageState(data.preferred_language);
        }
      } catch (err) {
        console.error('Error fetching region settings:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRegionSettings();
  }, [user]);

  const setCountry = async (newCountry: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setCountryState(newCountry);
      
      const { error } = await supabase
        .from('profiles')
        .update({ country: newCountry })
        .eq('id', user.id);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error setting country:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (newLanguage: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setLanguageState(newLanguage);
      
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_language: newLanguage })
        .eq('id', user.id);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error setting language:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    country,
    setCountry,
    language,
    setLanguage,
    currency,
    setCurrency,
    isLoading
  };
};
