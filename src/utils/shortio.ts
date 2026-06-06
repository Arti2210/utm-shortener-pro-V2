export interface ShortenResult {
  originalUrl: string;
  shortUrl: string | null;
  success: boolean;
  error?: string;
}

/**
 * Short.io API key format: `sk_XXXXXXXX` (no "Bearer" prefix needed —
 * the API expects the raw key in the `Authorization` header).
 */
export interface ShortenOptions {
  apiKey: string;
  /** Custom domain registered in Short.io, e.g. "arti.s.gy". */
  domain?: string;
  /** Optional TTL for the short link in seconds. */
  expiresAt?: number;
}

/**
 * Shortens a single URL using Short.io (https://api.short.io/links).
 * Uses native fetch (Node 18+ / browsers) — no external HTTP client.
 */
export async function shortenUrl(
  longUrl: string,
  apiKeyOrOptions: string | ShortenOptions
): Promise<ShortenResult> {
  const opts: ShortenOptions =
    typeof apiKeyOrOptions === 'string'
      ? { apiKey: apiKeyOrOptions }
      : apiKeyOrOptions;

  const apiKey = opts.apiKey?.trim();
  if (!apiKey) {
    return {
      originalUrl: longUrl,
      shortUrl: null,
      success: false,
      error: 'API key is required for shortening',
    };
  }

  try {
    const body: Record<string, any> = {
      originalURL: longUrl,
    };
    if (opts.domain) {
      body.domain = opts.domain;
    }
    if (typeof opts.expiresAt === 'number') {
      body.expiresAt = opts.expiresAt;
    }

    const response = await fetch('https://api.short.io/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: apiKey,
      },
      body: JSON.stringify(body),
    });

    const data: any = await response.json().catch(() => null);

    if (response.ok && data?.shortURL) {
      return {
        originalUrl: longUrl,
        shortUrl: data.shortURL,
        success: true,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        originalUrl: longUrl,
        shortUrl: null,
        success: false,
        error: 'Invalid or expired Short.io API key',
      };
    }

    if (response.status === 429) {
      return {
        originalUrl: longUrl,
        shortUrl: null,
        success: false,
        error: 'Rate limit exceeded. Please try again later.',
      };
    }

    if (response.status === 422) {
      return {
        originalUrl: longUrl,
        shortUrl: null,
        success: false,
        error:
          (Array.isArray(data?.errors) && data.errors.join(', ')) ||
          data?.message ||
          'Invalid URL or parameters',
      };
    }

    return {
      originalUrl: longUrl,
      shortUrl: null,
      success: false,
      error: data?.message || `Short.io API error (${response.status})`,
    };
  } catch (e: any) {
    if (e?.name === 'AbortError' || e?.code === 'ABORT_ERR') {
      return {
        originalUrl: longUrl,
        shortUrl: null,
        success: false,
        error: 'Request aborted',
      };
    }
    return {
      originalUrl: longUrl,
      shortUrl: null,
      success: false,
      error: `Network error: ${e?.message || 'unknown'}`,
    };
  }
}
