export const translations = {
  uk: {
    // Header
    appName: 'UTM Shortener Pro',
    language: 'Мова',
    theme: 'Тема',
    settings: 'Налаштування',
    logout: 'Вихід',

    // Main Form
    baseUrl: 'Базова URL',
    baseUrlPlaceholder: 'https://example.com/page',
    campaignName: 'Назва кампанії',
    campaignNamePlaceholder: 'Введіть назву кампанії',
    selectCombinations: 'Виберіть комбінації',
    platforms: 'Платформи',
    mediums: 'Плейсменти',
    selectAll: 'Вибрати все',
    clearAll: 'Очистити все',
    generate: 'Генерувати посилання',

    // Platform Names
    telegram: 'Telegram',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    threads: 'Threads',

    // Medium Names
    post: 'Пост',
    story: 'Історія',
    reels: 'Рилс',

    // Results
    results: 'Результати',
    platform: 'Платформа',
    placement: 'Плейсмент',
    fullLink: 'Повне посилання',
    shortLink: 'Скорочене посилання',
    copy: 'Копіювати',
    copyAll: 'Копіювати все',
    copied: 'Скопійовано!',
    generatedAt: 'Згенеровано',
    noResults: 'Немає результатів',

    // History
    history: 'Історія',
    clearHistory: 'Очистити історію',
    noHistory: 'Історія пуста',

    // Settings
    apiKey: 'API ключ TinyURL',
    apiKeyPlaceholder: 'Введіть ваш API ключ',
    saveSettings: 'Зберегти',
    settingsSaved: 'Налаштування збережені',

    // Errors
    invalidUrl: 'Невалідна URL',
    invalidCampaignName: 'Невалідна назва кампанії',
    apiKeyRequired: 'API ключ обов\'язковий',
    errorGenerating: 'Помилка при генеруванні посилань',
    errorShortening: 'Помилка при скороченні посилання',
    apiKeyExpired: 'API ключ вичерпаний або невалідний',

    // Validation
    required: 'Обов\'язкове поле',
    selectAtLeastOne: 'Виберіть принаймні одну комбінацію',

    // Light/Dark Mode
    lightMode: 'Світла тема',
    darkMode: 'Темна тема',
  },
  en: {
    // Header
    appName: 'UTM Shortener Pro',
    language: 'Language',
    theme: 'Theme',
    settings: 'Settings',
    logout: 'Logout',

    // Main Form
    baseUrl: 'Base URL',
    baseUrlPlaceholder: 'https://example.com/page',
    campaignName: 'Campaign Name',
    campaignNamePlaceholder: 'Enter campaign name',
    selectCombinations: 'Select Combinations',
    platforms: 'Platforms',
    mediums: 'Placements',
    selectAll: 'Select All',
    clearAll: 'Clear All',
    generate: 'Generate Links',

    // Platform Names
    telegram: 'Telegram',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    threads: 'Threads',

    // Medium Names
    post: 'Post',
    story: 'Story',
    reels: 'Reels',

    // Results
    results: 'Results',
    platform: 'Platform',
    placement: 'Placement',
    fullLink: 'Full Link',
    shortLink: 'Short Link',
    copy: 'Copy',
    copyAll: 'Copy All',
    copied: 'Copied!',
    generatedAt: 'Generated at',
    noResults: 'No results',

    // History
    history: 'History',
    clearHistory: 'Clear History',
    noHistory: 'History is empty',

    // Settings
    apiKey: 'TinyURL API Key',
    apiKeyPlaceholder: 'Enter your API key',
    saveSettings: 'Save',
    settingsSaved: 'Settings saved',

    // Errors
    invalidUrl: 'Invalid URL',
    invalidCampaignName: 'Invalid campaign name',
    apiKeyRequired: 'API key is required',
    errorGenerating: 'Error generating links',
    errorShortening: 'Error shortening URL',
    apiKeyExpired: 'API key expired or invalid',

    // Validation
    required: 'Required field',
    selectAtLeastOne: 'Select at least one combination',

    // Light/Dark Mode
    lightMode: 'Light Mode',
    darkMode: 'Dark Mode',
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof (typeof translations)['uk'];

export function t(key: TranslationKey, language: Language = 'uk'): string {
  return translations[language][key] || key;
}
