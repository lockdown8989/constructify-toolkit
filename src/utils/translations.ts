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
  // Navigation menu translations
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
  | 'back'
  // Added missing translations
  | 'enterYourCountry'
  | 'selectCurrency'
  | 'locationDetected'
  | 'detectedCountry'
  | 'errorUpdatingSettings'
  | 'settingsUpdated'
  | 'regionSettingsUpdated'
  | 'unexpectedError'
  | 'tryAgainLater';

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
    // Navigation menu translations
    home: 'Home',
    about: 'About',
    contact: 'Contact',
    employees: 'Employees',
    employeeWorkflow: 'Employee Workflow',
    leaveManagement: 'Leave Management',
    shiftCalendar: 'Shift Calendar',
    salary: 'Salary',
    payslip: 'Payslip',
    scheduleRequests: 'Schedule Requests',
    team: 'Team',
    schedule: 'Schedule',
    leave: 'Leave',
    toggleMenu: 'Toggle menu',
    back: 'Back',
    // Added missing translations
    enterYourCountry: 'Enter your country',
    selectCurrency: 'Select currency',
    locationDetected: 'Location detected',
    detectedCountry: 'Detected country',
    errorUpdatingSettings: 'Error updating settings',
    settingsUpdated: 'Settings updated',
    regionSettingsUpdated: 'Your region and language settings have been successfully updated.',
    unexpectedError: 'An unexpected error occurred',
    tryAgainLater: 'Please try again later'
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
    // Navigation menu translations
    home: 'Inicio',
    about: 'Acerca de',
    contact: 'Contacto',
    employees: 'Empleados',
    employeeWorkflow: 'Flujo de trabajo',
    leaveManagement: 'Gestión de ausencias',
    shiftCalendar: 'Calendario de turnos',
    salary: 'Salario',
    payslip: 'Nómina',
    scheduleRequests: 'Solicitudes de horario',
    team: 'Equipo',
    schedule: 'Horario',
    leave: 'Ausencia',
    toggleMenu: 'Alternar menú',
    back: 'Atrás',
    // Added missing translations
    enterYourCountry: 'Ingrese su país',
    selectCurrency: 'Seleccionar moneda',
    locationDetected: 'Ubicación detectada',
    detectedCountry: 'País detectado',
    errorUpdatingSettings: 'Error al actualizar la configuración',
    settingsUpdated: 'Configuración actualizada',
    regionSettingsUpdated: 'Su configuración de región e idioma se ha actualizado correctamente.',
    unexpectedError: 'Se produjo un error inesperado',
    tryAgainLater: 'Por favor, inténtelo de nuevo más tarde'
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
    // Navigation menu translations
    home: 'Начало',
    about: 'За нас',
    contact: 'Контакт',
    employees: 'Служители',
    employeeWorkflow: 'Работен процес',
    leaveManagement: 'Управление на отпуските',
    shiftCalendar: 'Календар на смените',
    salary: 'Заплата',
    payslip: 'Фиш за заплата',
    scheduleRequests: 'Заявки за график',
    team: 'Екип',
    schedule: 'График',
    leave: 'Отпуск',
    toggleMenu: 'Превключване на менюто',
    back: 'Назад',
    // Added missing translations
    enterYourCountry: 'Въведете вашата държава',
    selectCurrency: 'Изберете валута',
    locationDetected: 'Местоположението е открито',
    detectedCountry: 'Открита държава',
    errorUpdatingSettings: 'Грешка при актуализиране на настройките',
    settingsUpdated: 'Настройките са актуализирани',
    regionSettingsUpdated: 'Вашите настройки за регион и език са актуализирани успешно.',
    unexpectedError: 'Възникна неочаквана грешка',
    tryAgainLater: 'Моля, опитайте отново по-късно'
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
    // Navigation menu translations
    home: 'Strona główna',
    about: 'O nas',
    contact: 'Kontakt',
    employees: 'Pracownicy',
    employeeWorkflow: 'Przepływ pracy',
    leaveManagement: 'Zarządzanie urlopami',
    shiftCalendar: 'Kalendarz zmian',
    salary: 'Wynagrodzenie',
    payslip: 'Odcinek wypłaty',
    scheduleRequests: 'Prośby o harmonogram',
    team: 'Zespół',
    schedule: 'Harmonogram',
    leave: 'Urlop',
    toggleMenu: 'Przełącz menu',
    back: 'Wstecz',
    // Added missing translations
    enterYourCountry: 'Wprowadź swój kraj',
    selectCurrency: 'Wybierz walutę',
    locationDetected: 'Lokalizacja wykryta',
    detectedCountry: 'Wykryty kraj',
    errorUpdatingSettings: 'Błąd podczas aktualizacji ustawień',
    settingsUpdated: 'Ustawienia zaktualizowane',
    regionSettingsUpdated: 'Twoje ustawienia regionu i języka zostały pomyślnie zaktualizowane.',
    unexpectedError: 'Wystąpił nieoczekiwany błąd',
    tryAgainLater: 'Spróbuj ponownie później'
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
    // Navigation menu translations
    home: 'Acasă',
    about: 'Despre noi',
    contact: 'Contact',
    employees: 'Angajați',
    employeeWorkflow: 'Flux de lucru',
    leaveManagement: 'Gestionarea concediilor',
    shiftCalendar: 'Calendar de schimburi',
    salary: 'Salariu',
    payslip: 'Fluturaș de salariu',
    scheduleRequests: 'Cereri de program',
    team: 'Echipă',
    schedule: 'Program',
    leave: 'Concediu',
    toggleMenu: 'Comutare meniu',
    back: 'Înapoi',
    // Added missing translations
    enterYourCountry: 'Introduceți țara dvs.',
    selectCurrency: 'Selectați moneda',
    locationDetected: 'Locație detectată',
    detectedCountry: 'Țară detectată',
    errorUpdatingSettings: 'Eroare la actualizarea setărilor',
    settingsUpdated: 'Setări actualizate',
    regionSettingsUpdated: 'Setările regionale și de limbă au fost actualizate cu succes.',
    unexpectedError: 'A apărut o eroare neașteptată',
    tryAgainLater: 'Vă rugăm să încercați din nou mai târziu'
  }
};
