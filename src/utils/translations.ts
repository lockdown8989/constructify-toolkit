
export type TranslationKey = 
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
  | 'location'
  | 'preferredCurrency'
  | 'preferredLanguage'
  | 'autoDetect'
  | 'detecting'
  | 'profile'
  | 'manageProfile'
  | 'personalInfo'
  | 'updatePersonalInfo'
  | 'loading'
  | 'profile_settings'
  | 'account_settings'  
  | 'region_language';

export type Translations = Record<TranslationKey, string>;

export const translations: Record<string, Translations> = {
  en: {
    settings: 'Settings',
    manageSettings: 'Manage your account settings and preferences',
    regionCurrency: 'Region & Currency Settings',
    configureLocation: 'Configure your location and preferred currency',
    appearance: 'Appearance Settings',
    customizeAppearance: 'Customize the appearance of the application',
    language: 'Language Settings',
    chooseLanguage: 'Choose your preferred language',
    notifications: 'Notification Settings',
    manageNotifications: 'Manage how you receive notifications',
    saveChanges: 'Save Changes',
    saving: 'Saving...',
    location: 'Location',
    preferredCurrency: 'Preferred Currency',
    preferredLanguage: 'Preferred Language',
    autoDetect: 'Auto-detect Location',
    detecting: 'Detecting...',
    profile: 'Your Profile',
    manageProfile: 'Manage your personal information and preferences',
    personalInfo: 'Personal Information',
    updatePersonalInfo: 'Update your personal details and preferences',
    loading: 'Loading...',
    profile_settings: 'Profile Settings',
    account_settings: 'Account Settings',
    region_language: 'Region & Language'
  },
  es: {
    settings: 'Configuración',
    manageSettings: 'Administre la configuración y preferencias de su cuenta',
    regionCurrency: 'Configuración de región y moneda',
    configureLocation: 'Configure su ubicación y moneda preferida',
    appearance: 'Configuración de apariencia',
    customizeAppearance: 'Personalice la apariencia de la aplicación',
    language: 'Configuración de idioma',
    chooseLanguage: 'Elija su idioma preferido',
    notifications: 'Configuración de notificaciones',
    manageNotifications: 'Administre cómo recibe notificaciones',
    saveChanges: 'Guardar cambios',
    saving: 'Guardando...',
    location: 'Ubicación',
    preferredCurrency: 'Moneda preferida',
    preferredLanguage: 'Idioma preferido',
    autoDetect: 'Detectar ubicación',
    detecting: 'Detectando...',
    profile: 'Su perfil',
    manageProfile: 'Administre su información personal y preferencias',
    personalInfo: 'Información personal',
    updatePersonalInfo: 'Actualice sus datos personales y preferencias',
    loading: 'Cargando...',
    profile_settings: 'Configuración de perfil',
    account_settings: 'Configuración de la cuenta',
    region_language: 'Región e idioma'
  },
  bg: {
    settings: 'Настройки',
    manageSettings: 'Управлявайте настройките и предпочитанията на акаунта си',
    regionCurrency: 'Настройки на региона и валутата',
    configureLocation: 'Конфигурирайте местоположението и предпочитаната валута',
    appearance: 'Настройки на изгледа',
    customizeAppearance: 'Персонализирайте изгледа на приложението',
    language: 'Езикови настройки',
    chooseLanguage: 'Изберете предпочитания от вас език',
    notifications: 'Настройки за известията',
    manageNotifications: 'Управлявайте как получавате известия',
    saveChanges: 'Запазване на промените',
    saving: 'Запазване...',
    location: 'Местоположение',
    preferredCurrency: 'Предпочитана валута',
    preferredLanguage: 'Предпочитан език',
    autoDetect: 'Автоматично откриване на местоположението',
    detecting: 'Откриване...',
    profile: 'Вашият профил',
    manageProfile: 'Управлявайте личната си информация и предпочитания',
    personalInfo: 'Лична информация',
    updatePersonalInfo: 'Актуализирайте личните си данни и предпочитания',
    loading: 'Зареждане...',
    profile_settings: 'Настройки на профила',
    account_settings: 'Настройки на акаунта',
    region_language: 'Регион и език'
  },
  pl: {
    settings: 'Ustawienia',
    manageSettings: 'Zarządzaj ustawieniami i preferencjami konta',
    regionCurrency: 'Ustawienia regionu i waluty',
    configureLocation: 'Skonfiguruj swoją lokalizację i preferowaną walutę',
    appearance: 'Ustawienia wyglądu',
    customizeAppearance: 'Dostosuj wygląd aplikacji',
    language: 'Ustawienia języka',
    chooseLanguage: 'Wybierz preferowany język',
    notifications: 'Ustawienia powiadomień',
    manageNotifications: 'Zarządzaj sposobem otrzymywania powiadomień',
    saveChanges: 'Zapisz zmiany',
    saving: 'Zapisywanie...',
    location: 'Lokalizacja',
    preferredCurrency: 'Preferowana waluta',
    preferredLanguage: 'Preferowany język',
    autoDetect: 'Automatycznie wykryj lokalizację',
    detecting: 'Wykrywanie...',
    profile: 'Twój profil',
    manageProfile: 'Zarządzaj swoimi danymi osobowymi i preferencjami',
    personalInfo: 'Informacje osobiste',
    updatePersonalInfo: 'Zaktualizuj swoje dane osobowe i preferencje',
    loading: 'Ładowanie...',
    profile_settings: 'Ustawienia profilu',
    account_settings: 'Ustawienia konta',
    region_language: 'Region i język'
  },
  ro: {
    settings: 'Setări',
    manageSettings: 'Gestionați setările și preferințele contului dvs.',
    regionCurrency: 'Setări regiune și monedă',
    configureLocation: 'Configurați locația și moneda preferată',
    appearance: 'Setări de aspect',
    customizeAppearance: 'Personalizați aspectul aplicației',
    language: 'Setări de limbă',
    chooseLanguage: 'Alegeți limba preferată',
    notifications: 'Setări notificări',
    manageNotifications: 'Gestionați modul în care primiți notificări',
    saveChanges: 'Salvează modificările',
    saving: 'Se salvează...',
    location: 'Locație',
    preferredCurrency: 'Monedă preferată',
    preferredLanguage: 'Limbă preferată',
    autoDetect: 'Detectare automată a locației',
    detecting: 'Se detectează...',
    profile: 'Profilul tău',
    manageProfile: 'Gestionați informațiile personale și preferințele',
    personalInfo: 'Informații personale',
    updatePersonalInfo: 'Actualizați-vă datele personale și preferințele',
    loading: 'Se încarcă...',
    profile_settings: 'Setări profil',
    account_settings: 'Setări cont',
    region_language: 'Regiune și limbă'
  }
};
