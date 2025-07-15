
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
          toast({
            title: "Error loading language preferences",
            description: error.message,
            variant: "destructive",
          });
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
  }, [user, toast]);

  const setLanguage = async (newLanguage: LanguageCode) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ preferred_language: newLanguage })
        .eq('id', user.id);

      if (error) {
        console.error('Error updating language preference:', error);
        toast({
          title: "Error updating language",
          description: error.message,
          variant: "destructive",
        });
      } else {
        setLanguageState(newLanguage);
        toast({
          title: "Language Updated",
          description: `Language has been changed to ${languageOptions.find(opt => opt.value === newLanguage)?.label}`,
        });
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error updating language",
        description: error.message,
        variant: "destructive",
      });
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
