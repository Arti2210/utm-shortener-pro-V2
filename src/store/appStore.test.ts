import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore, PLATFORMS, MEDIUMS, isValidCombination } from './appStore';

describe('PLATFORMS and MEDIUMS', () => {
  it('has 6 platforms including YouTube', () => {
    expect(PLATFORMS).toHaveLength(6);
    const codes = PLATFORMS.map((p) => p.code);
    expect(codes).toContain('youtube');
    expect(codes).toContain('telegram');
    expect(codes).toContain('facebook');
    expect(codes).toContain('instagram');
    expect(codes).toContain('linkedin');
    expect(codes).toContain('threads');
  });

  it('has 4 mediums including Profile Header', () => {
    expect(MEDIUMS).toHaveLength(4);
    const codes = MEDIUMS.map((m) => m.code);
    expect(codes).toContain('post');
    expect(codes).toContain('story');
    expect(codes).toContain('reels');
    expect(codes).toContain('profile_header');
  });
});

describe('isValidCombination', () => {
  it('allows post/story/reels on every platform', () => {
    for (const p of PLATFORMS) {
      expect(isValidCombination(p.code, 'post')).toBe(true);
      expect(isValidCombination(p.code, 'story')).toBe(true);
      expect(isValidCombination(p.code, 'reels')).toBe(true);
    }
  });

  it('allows profile_header only on youtube', () => {
    expect(isValidCombination('youtube', 'profile_header')).toBe(true);
    for (const p of PLATFORMS.filter((p) => p.code !== 'youtube')) {
      expect(isValidCombination(p.code, 'profile_header')).toBe(false);
    }
  });

  it('rejects unknown medium', () => {
    expect(isValidCombination('telegram', 'unknown')).toBe(false);
  });
});

describe('useAppStore — cell selection', () => {
  beforeEach(() => {
    useAppStore.setState({
      baseUrl: '',
      campaignName: '',
      selectedCells: [],
      currentResults: [],
      isGenerating: false,
      error: null,
    });
  });

  it('toggleCell adds a single (platform, placement) pair', () => {
    const { toggleCell, isCellSelected, getSelectedCombinationsCount } =
      useAppStore.getState();
    toggleCell('linkedin', 'story');
    expect(isCellSelected('linkedin', 'story')).toBe(true);
    expect(getSelectedCombinationsCount()).toBe(1);
  });

  it('toggleCell on a different pair does not light up the previous one', () => {
    // Regression: old bug — selecting one cell caused extra cells to light up
    // because state was two separate arrays and the matrix built the cartesian
    // product on every render. With cell-based storage this must not happen.
    const { toggleCell, isCellSelected, getSelectedCombinationsCount } =
      useAppStore.getState();
    toggleCell('linkedin', 'story');
    toggleCell('instagram', 'reels');
    expect(isCellSelected('linkedin', 'story')).toBe(true);
    expect(isCellSelected('instagram', 'reels')).toBe(true);
    expect(isCellSelected('linkedin', 'reels')).toBe(false);
    expect(isCellSelected('instagram', 'story')).toBe(false);
    expect(isCellSelected('linkedin', 'post')).toBe(false);
    expect(getSelectedCombinationsCount()).toBe(2);
  });

  it('toggleCell twice on the same pair deselects it', () => {
    const { toggleCell, isCellSelected, getSelectedCombinationsCount } =
      useAppStore.getState();
    toggleCell('linkedin', 'story');
    toggleCell('linkedin', 'story');
    expect(isCellSelected('linkedin', 'story')).toBe(false);
    expect(getSelectedCombinationsCount()).toBe(0);
  });

  it('toggleCell ignores invalid combinations', () => {
    const { toggleCell, isCellSelected, getSelectedCombinationsCount } =
      useAppStore.getState();
    // profile_header is YouTube-only
    toggleCell('telegram', 'profile_header');
    expect(isCellSelected('telegram', 'profile_header')).toBe(false);
    expect(getSelectedCombinationsCount()).toBe(0);
  });

  it('selectAllCells / clearAllCells', () => {
    const { selectAllCells, clearAllCells, getSelectedCombinationsCount } =
      useAppStore.getState();
    selectAllCells();
    // 6 platforms × 3 universal mediums + 1 (youtube + profile_header) = 19
    expect(getSelectedCombinationsCount()).toBe(19);
    clearAllCells();
    expect(getSelectedCombinationsCount()).toBe(0);
  });

  it('togglePlatformColumn fills an entire platform column', () => {
    const { togglePlatformColumn, getSelectedCombinationsCount } =
      useAppStore.getState();
    togglePlatformColumn('linkedin');
    // linkedin accepts post, story, reels — 3 cells
    expect(getSelectedCombinationsCount()).toBe(3);
  });

  it('togglePlatformColumn twice clears the column', () => {
    const { togglePlatformColumn, getSelectedCombinationsCount } =
      useAppStore.getState();
    togglePlatformColumn('linkedin');
    togglePlatformColumn('linkedin');
    expect(getSelectedCombinationsCount()).toBe(0);
  });

  it('togglePlacementRow fills an entire placement row', () => {
    const { togglePlacementRow, getSelectedCombinationsCount } =
      useAppStore.getState();
    togglePlacementRow('story');
    // story is valid on all 6 platforms
    expect(getSelectedCombinationsCount()).toBe(6);
  });

  it('loadFromHistory rebuilds selectedCells from results', () => {
    const { addToHistory, loadFromHistory, isCellSelected } =
      useAppStore.getState();
    addToHistory({
      campaignName: 'sale',
      baseUrl: 'https://x.com',
      results: [
        {
          source: 'telegram',
          medium: 'post',
          fullUtmUrl: 'u',
          shortUrl: null,
          status: 'success',
          attempts: 1,
        },
        {
          source: 'instagram',
          medium: 'reels',
          fullUtmUrl: 'u',
          shortUrl: null,
          status: 'success',
          attempts: 1,
        },
      ],
      count: 2,
    });
    const hist = useAppStore.getState().history[0];
    loadFromHistory(hist);
    expect(isCellSelected('telegram', 'post')).toBe(true);
    expect(isCellSelected('instagram', 'reels')).toBe(true);
    expect(isCellSelected('instagram', 'post')).toBe(false);
  });
});

describe('useAppStore — results / history', () => {
  beforeEach(() => {
    useAppStore.setState({
      baseUrl: '',
      campaignName: '',
      selectedCells: [],
      currentResults: [],
      isGenerating: false,
      error: null,
      history: [],
    });
  });

  it('addToHistory stores items with id and timestamp', () => {
    const { addToHistory } = useAppStore.getState();
    addToHistory({
      campaignName: 'sale',
      baseUrl: 'https://x.com',
      results: [],
      count: 0,
    });
    const hist = useAppStore.getState().history;
    expect(hist).toHaveLength(1);
    expect(hist[0].id).toBeTruthy();
    expect(typeof hist[0].timestamp).toBe('number');
  });

  it('updateResult patches matching item', () => {
    const { setCurrentResults, updateResult } = useAppStore.getState();
    setCurrentResults([
      {
        source: 'telegram',
        medium: 'post',
        fullUtmUrl: 'https://x.com',
        shortUrl: null,
        status: 'pending',
        attempts: 0,
      },
    ]);
    updateResult('telegram', 'post', { status: 'success', shortUrl: 'https://t.co/abc' });
    const r = useAppStore.getState().currentResults[0];
    expect(r.status).toBe('success');
    expect(r.shortUrl).toBe('https://t.co/abc');
  });

  it('getFailedResults returns only failed items', () => {
    const { setCurrentResults, getFailedResults } = useAppStore.getState();
    setCurrentResults([
      { source: 'a', medium: 'b', fullUtmUrl: 'u', shortUrl: null, status: 'success', attempts: 1 },
      { source: 'c', medium: 'd', fullUtmUrl: 'u', shortUrl: null, status: 'failed', attempts: 3, error: 'err' },
    ]);
    const failed = getFailedResults();
    expect(failed).toHaveLength(1);
    expect(failed[0].source).toBe('c');
  });
});

describe('useAppStore — settings', () => {
  beforeEach(() => {
    useAppStore.setState({
      baseUrl: '',
      campaignName: '',
      selectedCells: [],
      currentResults: [],
      isGenerating: false,
      error: null,
      history: [],
    });
  });

  it('setLanguage updates state', () => {
    const { setLanguage } = useAppStore.getState();
    setLanguage('en');
    expect(useAppStore.getState().language).toBe('en');
  });

  it('setTheme updates state', () => {
    const { setTheme } = useAppStore.getState();
    setTheme('light');
    expect(useAppStore.getState().theme).toBe('light');
  });

  it('resetForm clears selected cells and results', () => {
    useAppStore.setState({
      selectedCells: [{ platform: 'telegram', placement: 'post' }],
      currentResults: [
        {
          source: 'telegram',
          medium: 'post',
          fullUtmUrl: 'u',
          shortUrl: null,
          status: 'pending',
          attempts: 0,
        },
      ],
    });
    useAppStore.getState().resetForm();
    expect(useAppStore.getState().selectedCells).toEqual([]);
    expect(useAppStore.getState().currentResults).toEqual([]);
  });
});
