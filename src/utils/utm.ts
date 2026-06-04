/**
 * UTM URL Builder - Generates valid UTM-tagged URLs
 */

export interface UTMParams {
  baseUrl: string;
  campaign: string;
  source: string;
  medium: string;
  term?: string;
  content?: string;
}

/**
 * Validates if a URL is properly formatted
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Builds a complete UTM URL with proper encoding
 */
export function buildUtmUrl(params: UTMParams): string {
  if (!isValidUrl(params.baseUrl)) {
    throw new Error('Invalid base URL format');
  }

  const url = new URL(params.baseUrl);
  const searchParams = new URLSearchParams(url.search);

  // Add UTM parameters
  searchParams.set('utm_campaign', params.campaign);
  searchParams.set('utm_source', params.source);
  searchParams.set('utm_medium', params.medium);

  // Add optional parameters if provided
  if (params.term) {
    searchParams.set('utm_term', params.term);
  }
  if (params.content) {
    searchParams.set('utm_content', params.content);
  }

  url.search = searchParams.toString();
  return url.toString();
}

/**
 * Generates multiple UTM URLs from combinations
 */
export function generateUtmCombinations(
  baseUrl: string,
  campaign: string,
  combinations: Array<{ source: string; medium: string }>
): Array<{ source: string; medium: string; utmUrl: string }> {
  return combinations.map((combo) => ({
    source: combo.source,
    medium: combo.medium,
    utmUrl: buildUtmUrl({
      baseUrl,
      campaign,
      source: combo.source,
      medium: combo.medium,
    }),
  }));
}

/**
 * Validates campaign name
 */
export function isValidCampaignName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 255;
}
