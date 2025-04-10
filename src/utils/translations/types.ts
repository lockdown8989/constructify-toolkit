
// Translation key types organized by feature
export type CoreTranslationKeys = 
  | 'settings'
  | 'manageSettings'
  | 'regionCurrency'
  | 'configureLocation'
  | 'appearance'
  | 'customizeAppearance'
  | 'language'
  | 'chooseLanguage'
  | 'notifications'
  | 'manageNotifications'
  | 'saveChanges'
  | 'saving'
  | 'loading';

export type RegionTranslationKeys =
  | 'location'
  | 'preferredCurrency'
  | 'preferredLanguage'
  | 'autoDetect'
  | 'detecting'
  | 'enterYourCountry'
  | 'selectCurrency'
  | 'locationDetected'
  | 'detectedCountry'
  | 'errorUpdatingSettings'
  | 'settingsUpdated'
  | 'regionSettingsUpdated'
  | 'unexpectedError'
  | 'tryAgainLater';

export type ProfileTranslationKeys =
  | 'profile'
  | 'manageProfile'
  | 'personalInfo'
  | 'updatePersonalInfo';

export type NavigationTranslationKeys =
  | 'home'
  | 'about'
  | 'contact'
  | 'employees'
  | 'employeeWorkflow'
  | 'leaveManagement'
  | 'shiftCalendar'
  | 'salary'
  | 'payslip'
  | 'scheduleRequests'
  | 'team'
  | 'schedule'
  | 'leave'
  | 'toggleMenu'
  | 'back';

// Add theme-related translation keys
export type ThemeTranslationKeys =
  | 'darkMode'
  | 'useDarkTheme'
  | 'light'
  | 'dark'
  | 'system'
  | 'lightModeOnly';

// Combined type with all translation keys
export type TranslationKey = 
  | CoreTranslationKeys
  | RegionTranslationKeys
  | ProfileTranslationKeys
  | NavigationTranslationKeys
  | ThemeTranslationKeys;

// Translations record type
export type Translations = Record<TranslationKey, string>;
