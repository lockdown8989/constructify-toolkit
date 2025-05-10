
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CAD' | 'AUD';

interface CurrencyContextProps {
  currency: Currency;
  setCurrency: (currency: Currency) => Promise<void>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextProps | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<Currency>('USD');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    const fetchCurrencyPreference = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_currency')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        if (data?.preferred_currency) {
          setCurrencyState(data.preferred_currency as Currency);
        }
      } catch (err) {
        console.error('Error fetching currency preference:', err);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCurrencyPreference();
  }, [user]);

  const setCurrency = async (newCurrency: Currency) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setCurrencyState(newCurrency);
      
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_currency: newCurrency })
        .eq('id', user.id);
        
      if (error) throw error;
    } catch (err) {
      console.error('Error setting currency preference:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrencyPreference = () => {
  const context = useContext(CurrencyContext);
  
  if (context === undefined) {
    throw new Error('useCurrencyPreference must be used within a CurrencyProvider');
  }
  
  return context;
};

export default useCurrencyPreference;
