
import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { translations, TranslationKey } from '@/utils/translations';

type LanguageCode = 'en' | 'es' | 'bg' | 'pl' | 'ro';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => Promise<void>;
  isLoading: boolean;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  isLoading: true,
  t: (key: TranslationKey) => key,
});

export const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'bg', label: 'Български (Bulgarian)' },
  { value: 'pl', label: 'Polski (Polish)' },
  { value: 'ro', label: 'Română (Romanian)' }
];

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLanguagePreference = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching language preference:', error);
        } else if (data?.preferred_language) {
          setLanguageState(data.preferred_language as LanguageCode);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguagePreference();
  }, [user]);

  const setLanguage = async (newLanguage: LanguageCode) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_language: newLanguage })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating language preference:', error);
      } else {
        setLanguageState(newLanguage);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Translation function
  const t = (key: TranslationKey): string => {
    const currentTranslations = translations[language] || translations.en;
    return currentTranslations[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);

export default useLanguage;
