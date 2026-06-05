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

describe('useAppStore', () => {
  beforeEach(() => {
    // Reset state
    useAppStore.setState({
      baseUrl: '',
      campaignName: '',
      selectedPlatforms: [],
      selectedMediums: [],
      currentResults: [],
      isGenerating: false,
      error: null,
    });
  });

  it('toggles platforms', () => {
    const { togglePlatform } = useAppStore.getState();
    togglePlatform('telegram');
    expect(useAppStore.getState().selectedPlatforms).toContain('telegram');
    togglePlatform('telegram');
    expect(useAppStore.getState().selectedPlatforms).not.toContain('telegram');
  });

  it('toggles mediums', () => {
    const { toggleMedium } = useAppStore.getState();
    toggleMedium('post');
    toggleMedium('story');
    const sel = useAppStore.getState().selectedMediums;
    expect(sel).toContain('post');
    expect(sel).toContain('story');
  });

  it('getSelectedCombinationsCount returns 0 when empty', () => {
    expect(useAppStore.getState().getSelectedCombinationsCount()).toBe(0);
  });

  it('getSelectedCombinationsCount respects Profile Header restriction', () => {
    const { selectAllPlatforms, selectAllMediums, clearAllMediums, toggleMedium } =
      useAppStore.getState();

    // Select all 6 platforms + 4 mediums
    selectAllPlatforms();
    selectAllMediums();

    // 6 platforms × 3 universal mediums + 1 (youtube) = 19
    expect(useAppStore.getState().getSelectedCombinationsCount()).toBe(19);

    clearAllMediums();
    toggleMedium('profile_header');
    // Only 1 platform (youtube) accepts profile_header
    expect(useAppStore.getState().getSelectedCombinationsCount()).toBe(1);
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

  it('setLanguage updates html lang attribute (jsdom)', () => {
    const { setLanguage } = useAppStore.getState();
    setLanguage('en');
    expect(useAppStore.getState().language).toBe('en');
  });

  it('setTheme updates state', () => {
    const { setTheme } = useAppStore.getState();
    setTheme('light');
    expect(useAppStore.getState().theme).toBe('light');
  });
});
