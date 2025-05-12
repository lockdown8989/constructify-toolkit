
import React, { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface CurrencyContextType {
  currency: string;
  updateCurrencyPreference: (newCurrency: string) => Promise<boolean>;
  isLoading: boolean;
  setCurrency: (currency: string) => void;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'GBP',
  updateCurrencyPreference: async () => false,
  isLoading: false,
  setCurrency: () => {},
});

export const useCurrencyPreference = () => useContext(CurrencyContext);

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrency] = useState<string>('GBP');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const fetchCurrencyPreference = async () => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_currency')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (data && data.preferred_currency) {
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

  const updateCurrencyPreference = async (newCurrency: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_currency: newCurrency })
        .eq('id', user.id);

      if (error) throw error;
      
      setCurrency(newCurrency);
      
      toast({
        title: "Currency Updated",
        description: `Your preferred currency has been set to ${newCurrency}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error updating currency preference:', error);
      
      toast({
        title: "Update Failed",
        description: "Failed to update your currency preference",
        variant: "destructive",
      });
      
      return false;
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, updateCurrencyPreference, isLoading, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
