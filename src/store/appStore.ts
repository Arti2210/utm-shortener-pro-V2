import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Language } from '../i18n/translations';

export interface Platform {
  code: string;
  name: string;
}

export interface Medium {
  code: string;
  name: string;
}

export interface GeneratedLink {
  source: string;
  medium: string;
  fullUtmUrl: string;
  shortUrl: string | null | undefined;
  status: 'success' | 'error';
  error?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  campaignName: string;
  baseUrl: string;
  results: GeneratedLink[];
  count: number;
}

export interface AppState {
  language: Language;
  theme: 'light' | 'dark';
  tinyUrlApiKey: string;
  baseUrl: string;
  campaignName: string;
  selectedPlatforms: string[];
  selectedMediums: string[];
  currentResults: GeneratedLink[];
  isGenerating: boolean;
  error: string | null;
  history: HistoryItem[];
  isSettingsOpen: boolean;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setTinyUrlApiKey: (key: string) => void;
  setBaseUrl: (url: string) => void;
  setCampaignName: (name: string) => void;
  togglePlatform: (code: string) => void;
  toggleMedium: (code: string) => void;
  selectAllPlatforms: () => void;
  clearAllPlatforms: () => void;
  selectAllMediums: () => void;
  clearAllMediums: () => void;
  setCurrentResults: (results: GeneratedLink[]) => void;
  setIsGenerating: (loading: boolean) => void;
  setError: (error: string | null) => void;
  addToHistory: (item: Omit<HistoryItem, 'id' | 'timestamp'>) => void;
  clearHistory: () => void;
  loadFromHistory: (item: HistoryItem) => void;
  openSettings: () => void;
  closeSettings: () => void;
  resetForm: () => void;
  getFilteredHistory: () => HistoryItem[];
  getSelectedCombinationsCount: () => number;
}

const PLATFORMS: Platform[] = [
  { code: 'tg', name: 'Telegram' },
  { code: 'fb', name: 'Facebook' },
  { code: 'li', name: 'LinkedIn' },
  { code: 'ig', name: 'Instagram' },
  { code: 'threads', name: 'Threads' },
];

const MEDIUMS: Medium[] = [
  { code: 'post', name: 'Post' },
  { code: 'story', name: 'Story' },
  { code: 'reels', name: 'Reels' },
];

const EXPIRATION_DAYS = 7;

const EXPIRATION_MS = EXPIRATION_DAYS * 24 * 60 * 60 * 1000;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'uk',
      theme: 'dark',
      tinyUrlApiKey: '',
      baseUrl: '',
      campaignName: '',
      selectedPlatforms: [],
      selectedMediums: [],
      currentResults: [],
      isGenerating: false,
      error: null,
      history: [],
      isSettingsOpen: false,
      setLanguage: (language) => {
        set({ language });
        if (typeof document !== 'undefined') {
          document.documentElement.lang = language;
        }
      },
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      setTinyUrlApiKey: (tinyUrlApiKey) => set({ tinyUrlApiKey }),
      setBaseUrl: (baseUrl) => set({ baseUrl, error: null }),
      setCampaignName: (campaignName) => set({ campaignName, error: null }),
      togglePlatform: (code) => {
        const { selectedPlatforms } = get();
        const newSelected = selectedPlatforms.includes(code)
          ? selectedPlatforms.filter(p => p !== code)
          : [...selectedPlatforms, code];
        set({ selectedPlatforms: newSelected });
      },
      toggleMedium: (code) => {
        const { selectedMediums } = get();
        const newSelected = selectedMediums.includes(code)
          ? selectedMediums.filter(m => m !== code)
          : [...selectedMediums, code];
        set({ selectedMediums: newSelected });
      },
      selectAllPlatforms: () => set({ selectedPlatforms: PLATFORMS.map(p => p.code) }),
      clearAllPlatforms: () => set({ selectedPlatforms: [] }),
      selectAllMediums: () => set({ selectedMediums: MEDIUMS.map(m => m.code) }),
      clearAllMediums: () => set({ selectedMediums: [] }),
      setCurrentResults: (currentResults) => set({ currentResults }),
      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),
      addToHistory: (item) => {
        const newItem: HistoryItem = {
          ...item,
          id: Date.now().toString(36) + Math.random().toString(36).substr(2),
          timestamp: Date.now(),
        };
        set((state) => ({
          history: [newItem, ...state.history].slice(0, 50),
        }));
      },
      clearHistory: () => set({ history: [] }),
      loadFromHistory: (item) => {
        set({
          baseUrl: item.baseUrl,
          campaignName: item.campaignName,
          currentResults: item.results,
          selectedPlatforms: [...new Set(item.results.map(r => r.source))],
          selectedMediums: [...new Set(item.results.map(r => r.medium))],
        });
      },
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
      resetForm: () => set({
        baseUrl: '',
        campaignName: '',
        selectedPlatforms: [],
        selectedMediums: [],
        currentResults: [],
        error: null,
      }),
      getFilteredHistory: () => {
        const now = Date.now();
        return get().history.filter(item => (now - item.timestamp) < EXPIRATION_MS);
      },
      getSelectedCombinationsCount: () => {
        const { selectedPlatforms, selectedMediums } = get();
        return selectedPlatforms.length * selectedMediums.length;
      },
    }),
    {
      name: 'utm-shortener-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        tinyUrlApiKey: state.tinyUrlApiKey,
        history: state.history,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          if (typeof document !== 'undefined') {
            if (state.theme === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
            document.documentElement.lang = state.language;
          }
          const now = Date.now();
          state.history = state.history.filter(
            (item: HistoryItem) => (now - item.timestamp) < EXPIRATION_MS
          );
        }
      },
    }
  )
);

export { PLATFORMS, MEDIUMS };
