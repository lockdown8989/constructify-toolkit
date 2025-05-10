
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

export function useCurrencyPreference() {
  const [currency, setCurrency] = useState('GBP');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Fetch user's currency preference from profile
  useEffect(() => {
    if (!user) return;

    const fetchCurrencyPreference = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_currency')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data?.preferred_currency) {
          setCurrency(data.preferred_currency);
        }
      } catch (error) {
        console.error('Error fetching currency preference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencyPreference();
  }, [user]);

  // Function to update currency preference
  const updateCurrencyPreference = async (newCurrency: string) => {
    if (!user) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_currency: newCurrency })
        .eq('id', user.id);

      if (error) throw error;
      
      setCurrency(newCurrency);
      return true;
    } catch (error) {
      console.error('Error updating currency preference:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    currency,
    updateCurrencyPreference,
    isLoading
  };
}
