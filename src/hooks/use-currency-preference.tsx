
import { useState, useEffect, createContext, useContext } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';

type CurrencyCode = 'USD' | 'GBP' | 'EUR';

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => Promise<void>;
  isLoading: boolean;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currency: 'USD',
  setCurrency: async () => {},
  isLoading: true,
});

export const CurrencyProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [currency, setCurrencyState] = useState<CurrencyCode>('USD');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrencyPreference = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_currency')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching currency preference:', error);
        } else if (data && data.preferred_currency) {
          setCurrencyState(data.preferred_currency as CurrencyCode);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrencyPreference();
  }, [user]);

  const setCurrency = async (newCurrency: CurrencyCode) => {
    if (!user) {
      // For non-authenticated users, just update the state locally
      setCurrencyState(newCurrency);
      return;
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_currency: newCurrency })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating currency preference:', error);
      } else {
        setCurrencyState(newCurrency);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrencyPreference = () => useContext(CurrencyContext);

export default useCurrencyPreference;
