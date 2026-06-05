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
  /** Platforms (codes) for which this medium is valid. Empty array = available to all. */
  availableFor?: string[];
}

export type LinkStatus = 'success' | 'failed' | 'pending';

export interface GeneratedLink {
  source: string;
  medium: string;
  fullUtmUrl: string;
  shortUrl: string | null;
  status: LinkStatus;
  error?: string;
  attempts: number;
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
  updateResult: (source: string, medium: string, patch: Partial<GeneratedLink>) => void;
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
  getFailedResults: () => GeneratedLink[];
}

export const PLATFORMS: Platform[] = [
  { code: 'telegram', name: 'Telegram' },
  { code: 'facebook', name: 'Facebook' },
  { code: 'instagram', name: 'Instagram' },
  { code: 'linkedin', name: 'LinkedIn' },
  { code: 'threads', name: 'Threads' },
  { code: 'youtube', name: 'YouTube' },
];

export const MEDIUMS: Medium[] = [
  { code: 'post', name: 'Post' },
  { code: 'story', name: 'Story' },
  { code: 'reels', name: 'Reels' },
  // Profile Header is YouTube-specific (channel header). It can still be picked
  // alongside the others but only yields a valid UTM combination for YouTube.
  { code: 'profile_header', name: 'Profile Header', availableFor: ['youtube'] },
];

/**
 * Returns true if the (platform, medium) combination is valid for the matrix.
 * Profile Header is only valid for YouTube; the rest are valid for all platforms.
 */
export function isValidCombination(platformCode: string, mediumCode: string): boolean {
  const medium = MEDIUMS.find((m) => m.code === mediumCode);
  if (!medium) return false;
  if (!medium.availableFor || medium.availableFor.length === 0) return true;
  return medium.availableFor.includes(platformCode);
}

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
          ? selectedPlatforms.filter((p) => p !== code)
          : [...selectedPlatforms, code];
        set({ selectedPlatforms: newSelected });
      },

      toggleMedium: (code) => {
        const { selectedMediums } = get();
        const newSelected = selectedMediums.includes(code)
          ? selectedMediums.filter((m) => m !== code)
          : [...selectedMediums, code];
        set({ selectedMediums: newSelected });
      },

      selectAllPlatforms: () => set({ selectedPlatforms: PLATFORMS.map((p) => p.code) }),
      clearAllPlatforms: () => set({ selectedPlatforms: [] }),
      selectAllMediums: () => set({ selectedMediums: MEDIUMS.map((m) => m.code) }),
      clearAllMediums: () => set({ selectedMediums: [] }),

      setCurrentResults: (currentResults) => set({ currentResults }),

      updateResult: (source, medium, patch) => {
        set((state) => ({
          currentResults: state.currentResults.map((r) =>
            r.source === source && r.medium === medium ? { ...r, ...patch } : r
          ),
        }));
      },

      setIsGenerating: (isGenerating) => set({ isGenerating }),
      setError: (error) => set({ error }),

      addToHistory: (item) => {
        const newItem: HistoryItem = {
          ...item,
          id: Date.now().toString(36) + Math.random().toString(36).slice(2),
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
          selectedPlatforms: [...new Set(item.results.map((r) => r.source))],
          selectedMediums: [...new Set(item.results.map((r) => r.medium))],
        });
      },

      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),

      resetForm: () =>
        set({
          baseUrl: '',
          campaignName: '',
          selectedPlatforms: [],
          selectedMediums: [],
          currentResults: [],
          error: null,
        }),

      getFilteredHistory: () => {
        const now = Date.now();
        return get().history.filter((item) => now - item.timestamp < EXPIRATION_MS);
      },

      getSelectedCombinationsCount: () => {
        const { selectedPlatforms, selectedMediums } = get();
        if (selectedPlatforms.length === 0 || selectedMediums.length === 0) return 0;
        let count = 0;
        for (const p of selectedPlatforms) {
          for (const m of selectedMediums) {
            if (isValidCombination(p, m)) count += 1;
          }
        }
        return count;
      },

      getFailedResults: () =>
        get().currentResults.filter((r) => r.status === 'failed'),
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
            (item: HistoryItem) => now - item.timestamp < EXPIRATION_MS
          );
        }
      },
    }
  )
);
