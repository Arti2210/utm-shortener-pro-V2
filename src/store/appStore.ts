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

/**
 * A selected cell is an explicit (platform, placement) pair.
 * The matrix stores cells independently so that toggling one cell
 * never causes another cell to light up.
 */
export interface SelectedCell {
  platform: string;
  placement: string;
}

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
  shortIoApiKey: string;
  shortIoDomain: string;
  baseUrl: string;
  campaignName: string;
  /** The list of selected (platform, placement) pairs. */
  selectedCells: SelectedCell[];
  currentResults: GeneratedLink[];
  isGenerating: boolean;
  error: string | null;
  history: HistoryItem[];
  isSettingsOpen: boolean;
  setLanguage: (lang: Language) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setShortIoApiKey: (key: string) => void;
  setShortIoDomain: (domain: string) => void;
  setBaseUrl: (url: string) => void;
  setCampaignName: (name: string) => void;
  /** Toggle a single (platform, placement) pair in the matrix. */
  toggleCell: (platform: string, placement: string) => void;
  /** Returns true if the cell is currently selected. */
  isCellSelected: (platform: string, placement: string) => boolean;
  /** Select every valid (platform, placement) pair. */
  selectAllCells: () => void;
  /** Clear all selected cells. */
  clearAllCells: () => void;
  /** Select all cells that belong to a single platform (any placement). */
  togglePlatformColumn: (platform: string) => void;
  /** Select all cells that belong to a single placement (any platform). */
  togglePlacementRow: (placement: string) => void;
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
  /** Number of currently selected cells. */
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
 * Returns true if the (platform, placement) combination is valid for the matrix.
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

const cellKey = (platform: string, placement: string) => `${platform}::${placement}`;

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      language: 'uk',
      theme: 'dark',
      shortIoApiKey: '',
      shortIoDomain: 'arti.s.gy',
      baseUrl: '',
      campaignName: '',
      selectedCells: [],
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

      setShortIoApiKey: (shortIoApiKey) => set({ shortIoApiKey }),
      setShortIoDomain: (shortIoDomain) =>
        set({ shortIoDomain: shortIoDomain.trim() }),
      setBaseUrl: (baseUrl) => set({ baseUrl, error: null }),
      setCampaignName: (campaignName) => set({ campaignName, error: null }),

      toggleCell: (platform, placement) => {
        if (!isValidCombination(platform, placement)) return;
        const { selectedCells } = get();
        const k = cellKey(platform, placement);
        const exists = selectedCells.some(
          (c) => cellKey(c.platform, c.placement) === k
        );
        if (exists) {
          set({
            selectedCells: selectedCells.filter(
              (c) => cellKey(c.platform, c.placement) !== k
            ),
          });
        } else {
          set({ selectedCells: [...selectedCells, { platform, placement }] });
        }
      },

      isCellSelected: (platform, placement) => {
        const k = cellKey(platform, placement);
        return get().selectedCells.some(
          (c) => cellKey(c.platform, c.placement) === k
        );
      },

      selectAllCells: () => {
        const cells: SelectedCell[] = [];
        for (const p of PLATFORMS) {
          for (const m of MEDIUMS) {
            if (isValidCombination(p.code, m.code)) {
              cells.push({ platform: p.code, placement: m.code });
            }
          }
        }
        set({ selectedCells: cells });
      },

      clearAllCells: () => set({ selectedCells: [] }),

      togglePlatformColumn: (platform) => {
        const { selectedCells } = get();
        const inColumn = selectedCells.filter((c) => c.platform === platform);
        // If every valid medium for this platform is already selected, deselect them.
        // Otherwise, fill the column.
        const validMediums = MEDIUMS.filter((m) =>
          isValidCombination(platform, m.code)
        );
        const allSelected = validMediums.every((m) =>
          inColumn.some((c) => c.placement === m.code)
        );
        if (allSelected) {
          set({
            selectedCells: selectedCells.filter((c) => c.platform !== platform),
          });
        } else {
          const withoutColumn = selectedCells.filter((c) => c.platform !== platform);
          const additions: SelectedCell[] = validMediums.map((m) => ({
            platform,
            placement: m.code,
          }));
          set({ selectedCells: [...withoutColumn, ...additions] });
        }
      },

      togglePlacementRow: (placement) => {
        const { selectedCells } = get();
        const inRow = selectedCells.filter((c) => c.placement === placement);
        const validPlatforms = PLATFORMS.filter((p) =>
          isValidCombination(p.code, placement)
        );
        const allSelected = validPlatforms.every((p) =>
          inRow.some((c) => c.platform === p.code)
        );
        if (allSelected) {
          set({
            selectedCells: selectedCells.filter((c) => c.placement !== placement),
          });
        } else {
          const withoutRow = selectedCells.filter((c) => c.placement !== placement);
          const additions: SelectedCell[] = validPlatforms.map((p) => ({
            platform: p.code,
            placement,
          }));
          set({ selectedCells: [...withoutRow, ...additions] });
        }
      },

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
        // Reconstruct the cell set from the stored results so the matrix
        // reflects what was generated last time.
        const cells: SelectedCell[] = item.results.map((r) => ({
          platform: r.source,
          placement: r.medium,
        }));
        set({
          baseUrl: item.baseUrl,
          campaignName: item.campaignName,
          currentResults: item.results,
          selectedCells: cells,
        });
      },

      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),

      resetForm: () =>
        set({
          baseUrl: '',
          campaignName: '',
          selectedCells: [],
          currentResults: [],
          error: null,
        }),

      getFilteredHistory: () => {
        const now = Date.now();
        return get().history.filter((item) => now - item.timestamp < EXPIRATION_MS);
      },

      getSelectedCombinationsCount: () => get().selectedCells.length,

      getFailedResults: () =>
        get().currentResults.filter((r) => r.status === 'failed'),
    }),
    {
      name: 'utm-shortener-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        language: state.language,
        theme: state.theme,
        shortIoApiKey: state.shortIoApiKey,
        shortIoDomain: state.shortIoDomain,
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
