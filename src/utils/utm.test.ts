import { describe, it, expect } from 'vitest';
import {
  isValidUrl,
  sanitizeCampaignName,
  buildUtmUrl,
  generateCombinations,
} from './utm';

describe('isValidUrl', () => {
  it('accepts http URLs', () => {
    expect(isValidUrl('http://example.com')).toBe(true);
  });

  it('accepts https URLs', () => {
    expect(isValidUrl('https://example.com/path?x=1')).toBe(true);
  });

  it('rejects empty strings', () => {
    expect(isValidUrl('')).toBe(false);
  });

  it('rejects non-http(s) protocols', () => {
    expect(isValidUrl('ftp://example.com')).toBe(false);
    expect(isValidUrl('javascript:alert(1)')).toBe(false);
    expect(isValidUrl('data:text/plain,hi')).toBe(false);
  });

  it('rejects malformed URLs', () => {
    expect(isValidUrl('not a url')).toBe(false);
    expect(isValidUrl('//example.com')).toBe(false);
  });

  it('trims whitespace before validating', () => {
    expect(isValidUrl('  https://example.com  ')).toBe(true);
  });
});

describe('sanitizeCampaignName', () => {
  it('keeps latin letters, digits, underscore and dash', () => {
    expect(sanitizeCampaignName('summer_sale-2024')).toBe('summer_sale-2024');
  });

  it('lowercases input', () => {
    expect(sanitizeCampaignName('SummerSale')).toBe('summersale');
  });

  it('replaces illegal chars with underscore', () => {
    expect(sanitizeCampaignName('summer sale 2024!')).toBe('summer_sale_2024');
  });

  it('collapses consecutive underscores', () => {
    expect(sanitizeCampaignName('a   b___c')).toBe('a_b_c');
  });

  it('trims leading and trailing underscores', () => {
    expect(sanitizeCampaignName('___hello___')).toBe('hello');
  });

  it('returns empty string for invalid input', () => {
    expect(sanitizeCampaignName('!!!')).toBe('');
    expect(sanitizeCampaignName('   ')).toBe('');
  });
});

describe('buildUtmUrl', () => {
  it('appends utm params', () => {
    const url = buildUtmUrl('https://example.com', 'telegram', 'post', 'sale_2024');
    expect(url).toBe('https://example.com?utm_source=telegram&utm_medium=post&utm_campaign=sale_2024');
  });

  it('strips trailing slash from base', () => {
    const url = buildUtmUrl('https://example.com/', 'fb', 'story', 'x');
    expect(url).toBe('https://example.com?utm_source=fb&utm_medium=story&utm_campaign=x');
  });

  it('sanitizes the campaign name', () => {
    const url = buildUtmUrl('https://example.com', 'fb', 'post', 'Sale 2024!');
    expect(url).toContain('utm_campaign=sale_2024');
  });

  it('strips existing query string from baseUrl (no double ?)', () => {
    const url = buildUtmUrl(
      'https://music.youtube.com/watch?v=mZbhFq362zg',
      'telegram',
      'post',
      'sale'
    );
    expect(url).not.toContain('?v=');
    expect(url).not.toMatch(/\?[^u]/); // first char after ? must be 'u' from utm_
    expect(url).toBe(
      'https://music.youtube.com/watch?utm_source=telegram&utm_medium=post&utm_campaign=sale'
    );
  });

  it('strips existing query string and trailing slash together', () => {
    const url = buildUtmUrl(
      'https://example.com/path/?utm_source=old&id=5',
      'fb',
      'story',
      'c'
    );
    expect(url).toBe('https://example.com/path?utm_source=fb&utm_medium=story&utm_campaign=c');
  });

  it('strips fragment from baseUrl', () => {
    const url = buildUtmUrl('https://example.com/page#section', 'fb', 'post', 'c');
    expect(url).toBe('https://example.com/page?utm_source=fb&utm_medium=post&utm_campaign=c');
  });
});

describe('generateCombinations', () => {
  it('produces cartesian product', () => {
    const out = generateCombinations(
      'https://example.com',
      'sale',
      ['telegram', 'facebook'],
      ['post', 'story']
    );
    expect(out).toHaveLength(4);
    expect(out[0]).toEqual({
      source: 'telegram',
      medium: 'post',
      fullUtmUrl: expect.stringContaining('utm_source=telegram'),
    });
  });

  it('returns empty when no inputs', () => {
    expect(generateCombinations('https://x.com', 'c', [], ['post'])).toHaveLength(0);
    expect(generateCombinations('https://x.com', 'c', ['tg'], [])).toHaveLength(0);
  });
});
