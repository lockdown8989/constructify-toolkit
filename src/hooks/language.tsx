
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { translations } from '@/utils/translations';
import type { TranslationKey, Translations } from '@/utils/translations';

export type LanguageType = 'en' | 'es' | 'bg' | 'pl' | 'ro';

export interface LanguageContextType {
  language: LanguageType;
  setLanguage: (language: LanguageType) => Promise<void>;
  t: (key: TranslationKey) => string;
  languageLoaded: boolean;
}

export const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'bg', label: 'Български' },
  { value: 'pl', label: 'Polski' },
  { value: 'ro', label: 'Română' }
];

const defaultLanguage: LanguageType = 'en';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: async () => {},
  t: (key) => key,
  languageLoaded: false
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageType>(defaultLanguage);
  const [languageLoaded, setLanguageLoaded] = useState<boolean>(false);

  useEffect(() => {
    async function loadInitialLanguage() {
      try {
        // First try to get language from localStorage
        const savedLang = localStorage.getItem('preferred_language') as LanguageType;
        if (savedLang && Object.keys(translations).includes(savedLang)) {
          setLanguageState(savedLang);
          setLanguageLoaded(true);
          return;
        }

        // If not in localStorage, try to get from user profile
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('preferred_language')
            .eq('id', user.id)
            .single();
          
          if (data?.preferred_language && Object.keys(translations).includes(data.preferred_language)) {
            const lang = data.preferred_language as LanguageType;
            setLanguageState(lang);
            localStorage.setItem('preferred_language', lang);
          }
        }
      } catch (error) {
        console.error('Error loading language preference:', error);
      } finally {
        setLanguageLoaded(true);
      }
    }

    loadInitialLanguage();
  }, []);
  
  const setLanguage = async (newLanguage: LanguageType) => {
    try {
      setLanguageState(newLanguage);
      localStorage.setItem('preferred_language', newLanguage);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        await supabase
          .from('profiles')
          .update({ preferred_language: newLanguage })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error setting language:', error);
    }
  };

  const t = (key: TranslationKey): string => {
    if (!translations[language]) return translations['en'][key] || key;
    return translations[language][key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languageLoaded }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
