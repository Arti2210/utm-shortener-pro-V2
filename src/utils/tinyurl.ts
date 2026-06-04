/**
 * TinyURL API Integration
 * Handles shortening of URLs using TinyURL API
 */

import axios from 'axios';

const TINYURL_API_BASE = 'https://api.tinyurl.com';

export interface ShortenUrlResponse {
  data: {
    tiny_url: string;
    request_id: string;
  };
}

export interface ShortenUrlError {
  code: number;
  message: string;
  details?: string;
}

/**
 * Shortens a URL using TinyURL API
 */
export async function shortenUrl(
  url: string,
  apiKey: string
): Promise<{ success: boolean; shortUrl?: string; error?: ShortenUrlError }> {
  try {
    if (!apiKey) {
      return {
        success: false,
        error: {
          code: 400,
          message: 'API key is required',
        },
      };
    }

    const response = await axios.post(
      `${TINYURL_API_BASE}/create`,
      {
        url,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return {
      success: true,
      shortUrl: response.data.data.tiny_url,
    };
  } catch (error: any) {
    const statusCode = error.response?.status || 500;
    const errorData = error.response?.data;

    // Handle specific error codes
    if (statusCode === 422) {
      return {
        success: false,
        error: {
          code: 422,
          message: 'Invalid URL format',
          details: errorData?.errors?.[0]?.message || 'The URL provided is not valid',
        },
      };
    }

    if (statusCode === 401) {
      return {
        success: false,
        error: {
          code: 401,
          message: 'Invalid or expired API key',
        },
      };
    }

    if (statusCode === 429) {
      return {
        success: false,
        error: {
          code: 429,
          message: 'API rate limit exceeded',
        },
      };
    }

    return {
      success: false,
      error: {
        code: statusCode,
        message: errorData?.message || 'Failed to shorten URL',
        details: error.message,
      },
    };
  }
}

/**
 * Batch shorten multiple URLs
 */
export async function shortenUrlsBatch(
  urls: string[],
  apiKey: string
): Promise<
  Array<{
    url: string;
    shortUrl?: string;
    error?: ShortenUrlError;
  }>
> {
  const results = await Promise.all(
    urls.map(async (url) => {
      const result = await shortenUrl(url, apiKey);
      return {
        url,
        shortUrl: result.shortUrl,
        error: result.error,
      };
    })
  );

  return results;
}
