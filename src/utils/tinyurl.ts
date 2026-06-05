export interface ShortenResult {
  originalUrl: string;
  shortUrl: string | null;
  success: boolean;
  error?: string;
}

/**
 * Shortens a single URL using TinyURL API v2.
 * Uses native fetch (Node 18+ / browsers) — no external HTTP client.
 */
export async function shortenUrl(
  longUrl: string,
  apiKey: string
): Promise<ShortenResult> {
  if (!apiKey || apiKey.trim() === '') {
    return {
      originalUrl: longUrl,
      shortUrl: null,
      success: false,
      error: 'API key is required for shortening',
    };
  }

  try {
    const response = await fetch('https://api.tinyurl.com/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify({
        url: longUrl,
        domain: 'tinyurl.com',
      }),
    });

    const data: any = await response.json().catch(() => null);

    if (response.ok && data?.data?.tiny_url) {
      return {
        originalUrl: longUrl,
        shortUrl: data.data.tiny_url,
        success: true,
      };
    }

    if (response.status === 401 || response.status === 403) {
      return {
        originalUrl: longUrl,
        shortUrl: null,
        success: false,
        error: 'Invalid or expired TinyURL API key',
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
        error: data?.errors?.join(', ') || 'Invalid URL or parameters',
      };
    }

    return {
      originalUrl: longUrl,
      shortUrl: null,
      success: false,
      error: data?.message || `TinyURL API error (${response.status})`,
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
