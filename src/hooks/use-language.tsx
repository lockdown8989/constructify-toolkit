
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
        console.log('Fetching language preference for user:', user?.id);
        
        // First check localStorage for immediate language setting
        const savedLanguage = localStorage.getItem('preferred_language') as LanguageCode;
        console.log('Language from localStorage:', savedLanguage);
        
        if (savedLanguage && languageOptions.find(opt => opt.value === savedLanguage)) {
          console.log('Setting language from localStorage:', savedLanguage);
          setLanguageState(savedLanguage);
          document.documentElement.lang = savedLanguage;
        }

        if (!user) {
          console.log('No user found, using default/localStorage language');
          setIsLoading(false);
          return;
        }

        // Then fetch from database for authenticated users
        console.log('Fetching from Supabase for user:', user.id);
        const { data, error } = await supabase
          .from('profiles')
          .select('preferred_language')
          .eq('id', user.id)
          .maybeSingle();

        if (error) {
          console.error('Error fetching language preference from Supabase:', error);
        } else if (data?.preferred_language) {
          const langCode = data.preferred_language as LanguageCode;
          console.log('Language from Supabase:', langCode);
          setLanguageState(langCode);
          localStorage.setItem('preferred_language', langCode);
          document.documentElement.lang = langCode;
        } else {
          console.log('No preferred_language found in Supabase profile');
        }
      } catch (error) {
        console.error('Error in fetchLanguagePreference:', error);
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
      document.documentElement.lang = newLanguage;

      if (user) {
        console.log('Updating language in Supabase for user:', user.id);
        const { error } = await supabase
          .from('profiles')
          .update({ preferred_language: newLanguage })
          .eq('id', user.id);

        if (error) {
          console.error('Error updating language preference in Supabase:', error);
          toast({
            title: "Error",
            description: "Failed to save language preference to database: " + error.message,
            variant: "destructive"
          });
          throw error;
        }
        
        console.log('Language successfully updated in Supabase');
      }

      console.log('Language successfully updated to:', newLanguage);
      
      // Force a complete re-render by dispatching a custom event
      window.dispatchEvent(new CustomEvent('languageChanged', { detail: newLanguage }));
      
    } catch (error: any) {
      console.error('Error in setLanguage:', error);
      
      // Revert local state on error
      const previousLanguage = localStorage.getItem('preferred_language') as LanguageCode || 'en';
      setLanguageState(previousLanguage);
      document.documentElement.lang = previousLanguage;
      
      throw error;
    }
  };

  const t = (key: TranslationKey): string => {
    const currentTranslations = translations[language] || translations.en;
    const translation = currentTranslations[key] || translations.en[key] || key;
    console.log(`Translation for key "${key}" in language "${language}":`, translation);
    return translation;
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
