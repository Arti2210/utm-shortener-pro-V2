import axios, { AxiosError } from 'axios';

export interface ShortenResult {
  originalUrl: string;
  shortUrl: string | null;
  success: boolean;
  error?: string;
}

/**
 * Shortens a single URL using TinyURL API v2
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
    const response = await axios.post(
      'https://api.tinyurl.com/create',
      {
        url: longUrl,
        domain: 'tinyurl.com',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey.trim()}`,
        },
        timeout: 10000,
      }
    );

    if (response.data && response.data.data && response.data.data.tiny_url) {
      return {
        originalUrl: longUrl,
        shortUrl: response.data.data.tiny_url,
        success: true,
      };
    }

    return {
      originalUrl: longUrl,
      shortUrl: null,
      success: false,
      error: 'Unexpected response from TinyURL',
    };
  } catch (error) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      const status = axiosError.response.status;
      const data = axiosError.response.data as any;
      
      if (status === 401 || status === 403) {
        return {
          originalUrl: longUrl,
          shortUrl: null,
          success: false,
          error: 'Invalid or expired TinyURL API key',
        };
      }
      
      if (status === 429) {
        return {
          originalUrl: longUrl,
          shortUrl: null,
          success: false,
          error: 'Rate limit exceeded. Please try again later.',
        };
      }
      
      if (status === 422) {
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
        error: data?.message || `TinyURL API error (${status})`,
      };
    }
    
    if (axiosError.code === 'ECONNABORTED') {
      return {
        originalUrl: longUrl,
        shortUrl: null,
        success: false,
        error: 'Request timeout. TinyURL API is slow.',
      };
    }
    
    return {
      originalUrl: longUrl,
      shortUrl: null,
      success: false,
      error: 'Network error while contacting TinyURL',
    };
  }
}

/**
 * Batch shorten multiple URLs with concurrency control
 */
export async function batchShortenUrls(
  urls: string[],
  apiKey: string,
  onProgress?: (completed: number, total: number) => void
): Promise<ShortenResult[]> {
  const results: ShortenResult[] = [];
  const total = urls.length;
  
  for (let i = 0; i < urls.length; i++) {
    const result = await shortenUrl(urls[i], apiKey);
    results.push(result);
    
    if (onProgress) {
      onProgress(i + 1, total);
    }
    
    if (i < urls.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 150));
    }
  }
  
  return results;
}