
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
  isLoading: true,
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
        // First check localStorage for immediate language setting
        const savedLanguage = localStorage.getItem('preferred_language') as LanguageCode;
        if (savedLanguage && languageOptions.find(opt => opt.value === savedLanguage)) {
          setLanguageState(savedLanguage);
        }

        if (!user) {
          setIsLoading(false);
          return;
        }

        // Then fetch from database for authenticated users
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching language preference:', error);
        } else if (data?.preferred_language) {
          const langCode = data.preferred_language as LanguageCode;
          setLanguageState(langCode);
          localStorage.setItem('preferred_language', langCode);
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
    console.log('Setting language to:', newLanguage);
    
    try {
      // Update local state immediately for responsive UI
      setLanguageState(newLanguage);
      
      // Save to localStorage for persistence
      localStorage.setItem('preferred_language', newLanguage);

      if (user) {
        const { error } = await supabase
          .from('profiles')
          .update({ preferred_language: newLanguage })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating language preference:', error);
          throw error;
        }
      }

      console.log('Language successfully updated to:', newLanguage);
      
      // Force a re-render of the entire app by updating the document language
      document.documentElement.lang = newLanguage;
      
      // Trigger a small delay then force re-render
      setTimeout(() => {
        window.dispatchEvent(new Event('languagechange'));
      }, 100);
      
    } catch (error: any) {
      console.error('Error in setLanguage:', error);
      // Revert local state on error
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('id', user.id)
          .maybeSingle();
        
        if (data?.preferred_language) {
          setLanguageState(data.preferred_language as LanguageCode);
        }
      }
      
      throw error;
    }
  };

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

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
};

export default useLanguage;
