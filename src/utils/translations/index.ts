
import { TranslationKey, Translations } from './types';
import { englishTranslations } from './en';
import { spanishTranslations } from './es';
import { bulgarianTranslations } from './bg';
import { polishTranslations } from './pl';
import { romanianTranslations } from './ro';

// Export the combined translations object
export const translations: Record<string, Translations> = {
  en: englishTranslations,
  es: spanishTranslations,
  bg: bulgarianTranslations,
  pl: polishTranslations,
  ro: romanianTranslations
};

// Re-export types
export type { TranslationKey, Translations };

// Export language options (moved from use-language.tsx)
export const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español (Spanish)' },
  { value: 'bg', label: 'Български (Bulgarian)' },
  { value: 'pl', label: 'Polski (Polish)' },
  { value: 'ro', label: 'Română (Romanian)' }
];
