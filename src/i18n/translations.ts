export type Language = 'uk' | 'en';

export interface Translations {
  // App
  appName: string;
  tagline: string;
  
  // Header
  language: string;
  theme: string;
  settings: string;
  dark: string;
  light: string;
  
  // Form
  formTitle: string;
  baseUrl: string;
  baseUrlPlaceholder: string;
  campaignName: string;
  campaignNamePlaceholder: string;
  campaignHint: string;
  
  // Matrix
  matrixTitle: string;
  platforms: string;
  mediums: string;
  selectAll: string;
  clearAll: string;
  cells: string;
  selected: string;
  combinationsWillBeGenerated: string;
  
  // Buttons
  generateLinks: string;
  generating: string;
  copy: string;
  copyAll: string;
  clearHistory: string;
  saveSettings: string;
  cancel: string;
  close: string;
  
  // Results
  resultsTitle: string;
  noResults: string;
  platform: string;
  medium: string;
  fullUtmUrl: string;
  shortUrl: string;
  status: string;
  actions: string;
  success: string;
  error: string;
  copyFull: string;
  copyShort: string;
  allCopied: string;
  
  // History
  historyTitle: string;
  historyEmpty: string;
  generatedAt: string;
  linksCount: string;
  view: string;
  expired: string;
  
  // Settings Modal
  settingsTitle: string;
  shortIoApiKey: string;
  shortIoDomain: string;
  shortIoDomainHint: string;
  apiKeyPlaceholder: string;
  apiKeyHint: string;
  apiKeySaved: string;
  testConnection: string;
  testing: string;
  connectionSuccess: string;
  connectionError: string;
  
  // Errors & Validation
  invalidUrl: string;
  urlRequired: string;
  campaignRequired: string;
  selectAtLeastOne: string;
  noApiKeyWarning: string;
  shortenFailed: string;
  networkError: string;
  unknownError: string;
  
  // Misc
  loading: string;
  copied: string;
  expiresIn: string;
  week: string;
  retryFailed: string;
  retrying: string;
}

export const translations: Record<Language, Translations> = {
  uk: {
    appName: 'UTM Shortener Pro',
    tagline: 'Генеруйте та скорочуйте UTM-посилання для маркетингу',
    
    language: 'Мова',
    theme: 'Тема',
    settings: 'Налаштування',
    dark: 'Темна',
    light: 'Світла',
    
    formTitle: 'Створення UTM-посилань',
    baseUrl: 'Базова URL',
    baseUrlPlaceholder: 'https://example.com/landing',
    campaignName: 'Назва кампанії (utm_campaign)',
    campaignNamePlaceholder: 'summer_sale_2024',
    campaignHint: 'Використовуйте латиницю, цифри, _ та -',
    
    matrixTitle: 'Матриця платформ та плейсментів',
    platforms: 'Платформи',
    mediums: 'Типи контенту',
    selectAll: 'Вибрати все',
    clearAll: 'Очистити все',
    cells: 'комірок',
    selected: 'Вибрано',
    combinationsWillBeGenerated: 'буде згенеровано комбінацій',
    
    generateLinks: 'Згенерувати посилання',
    generating: 'Генерація...',
    copy: 'Копіювати',
    copyAll: 'Копіювати всі short',
    clearHistory: 'Очистити історію',
    saveSettings: 'Зберегти',
    cancel: 'Скасувати',
    close: 'Закрити',
    
    resultsTitle: 'Результати генерації',
    noResults: 'Немає результатів. Заповніть форму та натисніть "Згенерувати посилання".', 
    platform: 'Платформа',
    medium: 'Тип',
    fullUtmUrl: 'Повне UTM',
    shortUrl: 'Коротке посилання',
    status: 'Статус',
    actions: 'Дії',
    success: 'Успіх',
    error: 'Помилка',
    copyFull: 'Копіювати повне',
    copyShort: 'Копіювати short',
    allCopied: 'Всі посилання скопійовано!',
    
    historyTitle: 'Історія генерацій',
    historyEmpty: 'Історія порожня. Згенеруйте перші посилання.',
    generatedAt: 'Створено',
    linksCount: 'Кількість посилань',
    view: 'Переглянути',
    expired: 'Минуло',
    
    settingsTitle: 'Налаштування користувача',
    shortIoApiKey: 'API ключ Short.io',
    shortIoDomain: 'Домен Short.io',
    shortIoDomainHint: 'Домен має бути зареєстрований у вашому акаунті Short.io',
    apiKeyPlaceholder: 'Введіть ваш Short.io API ключ (sk_…)',
    apiKeyHint: 'Ключ зберігається локально. Отримайте на app.short.io/settings/api',
    apiKeySaved: 'Налаштування збережено',
    testConnection: 'Перевірити зʼєднання',
    testing: 'Перевірка...',
    connectionSuccess: 'Зʼєднання успішне!',
    connectionError: 'Помилка зʼєднання. Перевірте ключ.',
    
    invalidUrl: 'Будь ласка, введіть коректну URL (починається з http:// або https://)',
    urlRequired: 'Базова URL обовʼязкова',
    campaignRequired: 'Назва кампанії обовʼязкова',
    selectAtLeastOne: 'Виберіть хоча б одну платформу та один тип контенту',
    noApiKeyWarning: 'API ключ не вказано. Буде згенеровано тільки повні UTM-посилання (без скорочення).',
    shortenFailed: 'Не вдалося скоротити',
    networkError: 'Помилка мережі. Спробуйте пізніше.',
    unknownError: 'Невідома помилка',
    
    loading: 'Завантаження...',
    copied: 'Скопійовано!',
    expiresIn: 'Зберігається',
    week: 'тиждень',
    retryFailed: 'Повторити невдалі',
    retrying: 'Повторюємо...',
  },
  en: {
    appName: 'UTM Shortener Pro',
    tagline: 'Generate and shorten UTM links for marketing campaigns',
    
    language: 'Language',
    theme: 'Theme',
    settings: 'Settings',
    dark: 'Dark',
    light: 'Light',
    
    formTitle: 'UTM Links Generation',
    baseUrl: 'Base URL',
    baseUrlPlaceholder: 'https://example.com/landing',
    campaignName: 'Campaign Name (utm_campaign)',
    campaignNamePlaceholder: 'summer_sale_2024',
    campaignHint: 'Use Latin letters, numbers, _ and -',
    
    matrixTitle: 'Platform & Placement Matrix',
    platforms: 'Platforms',
    mediums: 'Content Types',
    selectAll: 'Select All',
    clearAll: 'Clear All',
    cells: 'cells',
    selected: 'Selected',
    combinationsWillBeGenerated: 'combinations will be generated',
    
    generateLinks: 'Generate Links',
    generating: 'Generating...',
    copy: 'Copy',
    copyAll: 'Copy all shorts',
    clearHistory: 'Clear History',
    saveSettings: 'Save',
    cancel: 'Cancel',
    close: 'Close',
    
    resultsTitle: 'Generation Results',
    noResults: 'No results yet. Fill the form and click "Generate Links".', 
    platform: 'Platform',
    medium: 'Type',
    fullUtmUrl: 'Full UTM URL',
    shortUrl: 'Short URL',
    status: 'Status',
    actions: 'Actions',
    success: 'Success',
    error: 'Error',
    copyFull: 'Copy full',
    copyShort: 'Copy short',
    allCopied: 'All links copied to clipboard!',
    
    historyTitle: 'Generation History',
    historyEmpty: 'History is empty. Generate your first batch of links.',
    generatedAt: 'Generated',
    linksCount: 'Links count',
    view: 'View',
    expired: 'Expired',
    
    settingsTitle: 'User Settings',
    shortIoApiKey: 'Short.io API Key',
    shortIoDomain: 'Short.io domain',
    shortIoDomainHint: 'Domain must be registered in your Short.io account',
    apiKeyPlaceholder: 'Enter your Short.io API key (sk_…)',
    apiKeyHint: 'Key is stored locally in your browser. Get it at app.short.io/settings/api',
    apiKeySaved: 'Settings saved successfully',
    testConnection: 'Test Connection',
    testing: 'Testing...',
    connectionSuccess: 'Connection successful!',
    connectionError: 'Connection failed. Please check your API key.',
    
    invalidUrl: 'Please enter a valid URL starting with http:// or https://',
    urlRequired: 'Base URL is required',
    campaignRequired: 'Campaign name is required',
    selectAtLeastOne: 'Please select at least one platform and one content type',
    noApiKeyWarning: 'No API key provided. Only full UTM URLs will be generated (no shortening).',
    shortenFailed: 'Failed to shorten',
    networkError: 'Network error. Please try again later.',
    unknownError: 'Unknown error occurred',
    
    loading: 'Loading...',
    copied: 'Copied!',
    expiresIn: 'Stored for',
    week: '1 week',
    retryFailed: 'Retry failed',
    retrying: 'Retrying...',
  },
};

export function getTranslation(lang: Language, key: keyof Translations): string {
  return translations[lang][key] || key;
}