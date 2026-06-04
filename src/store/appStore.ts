import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Language = 'uk' | 'en';
export type Theme = 'light' | 'dark';

export interface GeneratedLink {
  id: string;
  source: string;
  medium: string;
  fullUtmUrl: string;
  shortUrl?: string;
  status: 'success' | 'failed';
  error?: string;
  createdAt: Date;
}

export interface HistoryItem {
  id: string;
  baseUrl: string;
  campaignName: string;
  links: GeneratedLink[];
  createdAt: Date;
  expiresAt: Date;
}

interface AppStore {
  // Settings
  language: Language;
  theme: Theme;
  apiKey: string;
  setLanguage: (language: Language) => void;
  setTheme: (theme: Theme) => void;
  setApiKey: (apiKey: string) => void;

  // Generated Links
  currentLinks: GeneratedLink[];
  setCurrentLinks: (links: GeneratedLink[]) => void;
  clearCurrentLinks: () => void;

  // History
  history: HistoryItem[];
  addToHistory: (item: HistoryItem) => void;
  clearHistory: () => void;
  removeExpiredItems: () => void;

  // Loading state
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // Error state
  error: string | null;
  setError: (error: string | null) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Settings
      language: 'uk',
      theme: 'dark',
      apiKey: '',
      setLanguage: (language) => set({ language }),
      setTheme: (theme) => set({ theme }),
      setApiKey: (apiKey) => set({ apiKey }),

      // Generated Links
      currentLinks: [],
      setCurrentLinks: (links) => set({ currentLinks: links }),
      clearCurrentLinks: () => set({ currentLinks: [] }),

      // History
      history: [],
      addToHistory: (item) =>
        set((state) => ({
          history: [item, ...state.history],
        })),
      clearHistory: () => set({ history: [] }),
      removeExpiredItems: () =>
        set((state) => ({
          history: state.history.filter((item) => new Date(item.expiresAt) > new Date()),
        })),

      // Loading state
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      // Error state
      error: null,
      setError: (error) => set({ error }),
    }),
    {
      name: 'utm-shortener-storage',
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        apiKey: state.apiKey,
        history: state.history,
      }),
    }
  )
);
