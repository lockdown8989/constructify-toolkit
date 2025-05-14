
import React, { createContext, useContext, useState } from 'react';

// Define the translation keys to ensure type safety
export type TranslationKey = 
  | 'signed_in_as'
  | 'profile'
  | 'profile_settings'
  | 'settings'
  | 'sign_out'
  | 'country'
  | 'language'
  | 'currency'
  | 'save_changes'
  | 'saving'
  | 'saveChanges'
  | 'cancel';

// Default translations
const translations: Record<string, Record<TranslationKey, string>> = {
  en: {
    signed_in_as: 'Signed in as',
    profile: 'Profile',
    profile_settings: 'Profile Settings',
    settings: 'Settings',
    sign_out: 'Sign Out',
    country: 'Country',
    language: 'Language',
    currency: 'Currency',
    save_changes: 'Save Changes',
    saving: 'Saving...',
    saveChanges: 'Save Changes',
    cancel: 'Cancel'
  },
};

// Language options for dropdown menus
export const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'bg', label: 'Български (Bulgarian)' },
  { value: 'pl', label: 'Polski (Polish)' },
  { value: 'ro', label: 'Română (Romanian)' }
];

type LanguageContextType = {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: TranslationKey) => string;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState('en');

  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  
  return context;
}
