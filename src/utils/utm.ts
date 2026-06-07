import { GeneratedLink } from '../store/appStore';

/**
 * Validates if a string is a proper http/https URL
 */
export function isValidUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url.trim());
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Sanitizes campaign name for UTM (allows a-z0-9_- .)
 */
export function sanitizeCampaignName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-.]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

/**
 * Builds a single UTM-tagged URL.
 *
 * Rules (per the project spec):
 *   - Any query string the base URL already has is dropped — we keep only the
 *     clean path, so the resulting link never contains a stray "?v=abc?..."
 *     double question mark.
 *   - Any trailing slash is stripped.
 *   - UTM parameters are URL-encoded via URLSearchParams.
 */
export function buildUtmUrl(
  baseUrl: string,
  source: string,
  medium: string,
  campaign: string
): string {
  const trimmed = baseUrl.trim();
  // Strip any existing query string / hash so the base is just scheme + host + path.
  const queryStart = trimmed.search(/[?#]/);
  const cleanBase = (queryStart >= 0 ? trimmed.slice(0, queryStart) : trimmed).replace(
    /\/$/,
    ''
  );

  const params = new URLSearchParams();
  params.set('utm_source', source);
  params.set('utm_medium', medium);
  params.set('utm_campaign', sanitizeCampaignName(campaign));

  return `${cleanBase}?${params.toString()}`;
}

/**
 * Generates all combinations of platforms x mediums with UTM URLs
 */
export function generateCombinations(
  baseUrl: string,
  campaignName: string,
  platforms: string[],
  mediums: string[]
): Array<{ source: string; medium: string; fullUtmUrl: string }> {
  const combinations: Array<{ source: string; medium: string; fullUtmUrl: string }> = [];
  
  for (const source of platforms) {
    for (const medium of mediums) {
      const fullUtmUrl = buildUtmUrl(baseUrl, source, medium, campaignName);
      combinations.push({ source, medium, fullUtmUrl });
    }
  }
  
  return combinations;
}

/**
 * Type guard for API response
 */
export interface GenerateApiResponse {
  success: boolean;
  data?: GeneratedLink[];
  error?: string;
  message?: string;
}