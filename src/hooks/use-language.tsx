import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/integrations/supabase/client';
import { translations, TranslationKey } from '@/utils/translations';
import { useToast } from '@/hooks/use-toast';

type LanguageCode = 'en' | 'es' | 'fr' | 'bg' | 'pl' | 'ro';

export const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'fr', label: 'Français (French)' },
  { value: 'bg', label: 'Български (Bulgarian)' },
  { value: 'pl', label: 'Polski (Polish)' },
  { value: 'ro', label: 'Română (Romanian)' }
];

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (language: LanguageCode) => Promise<void>;
  isLoading: boolean;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: async () => {},
  isLoading: false,
  t: (key: TranslationKey) => key,
});

export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [language, setLanguageState] = useState<LanguageCode>('en');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLanguagePreference = async () => {
      try {
        // First try to get from localStorage for immediate loading
        const savedLanguage = localStorage.getItem('preferred_language') as LanguageCode;
        if (savedLanguage && languageOptions.find(opt => opt.value === savedLanguage)) {
          console.log('Loading language from localStorage:', savedLanguage);
          setLanguageState(savedLanguage);
        }

        // If user is authenticated, try to get from database
        if (user?.id) {
          const { data, error } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('id', user.id)
            .maybeSingle();

          if (error) {
            console.error('Error fetching language preference:', error);
          } else if (data?.preferred_language) {
            const langCode = data.preferred_language as LanguageCode;
            console.log('Loading language from database:', langCode);
            setLanguageState(langCode);
            localStorage.setItem('preferred_language', langCode);
          }
        }
      } catch (error) {
        console.error('Error in fetchLanguagePreference:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLanguagePreference();
  }, [user?.id]);

  const setLanguage = async (newLanguage: LanguageCode) => {
    console.log('Setting language to:', newLanguage);
    
    try {
      // Update local state immediately for responsive UI
      setLanguageState(newLanguage);
      
      // Save to localStorage immediately
      localStorage.setItem('preferred_language', newLanguage);
      console.log('Language saved to localStorage:', newLanguage);

      // If user is authenticated, save to database
      if (user?.id) {
        const { error } = await supabase
          .from('profiles')
          .update({ preferred_language: newLanguage })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating language preference in database:', error);
          // Don't throw error, keep the local change
        } else {
          console.log('Language successfully updated in database:', newLanguage);
        }
      }

      // Force a re-render by updating the document language attribute
      document.documentElement.lang = newLanguage;
      
      console.log('Language change completed successfully');
    } catch (error: any) {
      console.error('Error in setLanguage:', error);
      // Don't revert the change, just log the error
    }
  };

  const t = (key: TranslationKey): string => {
    try {
      const currentTranslations = translations[language];
      if (!currentTranslations) {
        console.warn(`Translation not found for language: ${language}, falling back to English`);
        return translations.en[key] || key;
      }
      
      const translation = currentTranslations[key];
      if (!translation) {
        console.warn(`Translation key "${key}" not found for language: ${language}`);
        return translations.en[key] || key;
      }
      
      return translation;
    } catch (error) {
      console.error('Error in translation function:', error);
      return key;
    }
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isLoading, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};

export default useLanguage;
