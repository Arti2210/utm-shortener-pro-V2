import type { NextApiRequest, NextApiResponse } from 'next';
import { isValidUrl, sanitizeCampaignName, buildUtmUrl } from '../../../utils/utm';
import { shortenUrl, ShortenResult } from '../../../utils/shortio';
import { isValidCombination, GeneratedLink } from '../../../store/appStore';

interface SingleUrlBody {
  url: string;
  apiKey?: string;
  domain?: string;
}

interface BatchBody {
  baseUrl: string;
  campaignName: string;
  combinations: Array<{ source: string; medium: string }>;
  apiKey?: string;
  domain?: string;
}

type GenerateBody = SingleUrlBody | BatchBody;

function isSingleUrl(body: any): body is SingleUrlBody {
  return body && typeof body.url === 'string';
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean; data?: GeneratedLink; data_batch?: GeneratedLink[]; error?: string; message?: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body: GenerateBody = req.body;

    // --- Single URL mode (used for retries / per-link shortening) ---
    if (isSingleUrl(body)) {
      if (!isValidUrl(body.url)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL. Must be a valid http/https URL.',
        });
      }

      const apiKey = body.apiKey?.trim();
      if (!apiKey) {
        return res.status(400).json({
          success: false,
          error: 'Short.io API key is required for shortening',
        });
      }

      const result: ShortenResult = await shortenUrl(body.url, {
        apiKey,
        domain: body.domain?.trim() || undefined,
      });

      // Build a thin GeneratedLink so the client can update via (source, medium).
      // We can't reliably decompose the UTM URL client-side, so we echo what we can.
      let source = '';
      let medium = '';
      try {
        const params = new URL(body.url).searchParams;
        source = params.get('utm_source') || '';
        medium = params.get('utm_medium') || '';
      } catch {
        /* ignore — body.url is already validated */
      }

      return res.status(result.success ? 200 : 502).json({
        success: result.success,
        data: {
          source,
          medium,
          fullUtmUrl: body.url,
          shortUrl: result.shortUrl,
          status: result.success ? 'success' : 'failed',
          error: result.error,
          attempts: 1,
        },
        error: result.success ? undefined : result.error,
      });
    }

    // --- Batch mode ---
    const { baseUrl, campaignName, combinations } = body as BatchBody;

    if (!baseUrl || !isValidUrl(baseUrl)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or missing baseUrl. Must be a valid http/https URL.',
      });
    }

    if (!campaignName || campaignName.trim().length < 2) {
      return res.status(400).json({
        success: false,
        error: 'Campaign name is required (min 2 characters).',
      });
    }

    if (!Array.isArray(combinations) || combinations.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No platform/medium combinations provided.',
      });
    }

    if (combinations.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Too many combinations (max 50 allowed per request).',
      });
    }

    // Filter out invalid (platform, medium) combinations
    const validCombos = combinations.filter(
      (c) => c.source && c.medium && isValidCombination(c.source, c.medium)
    );

    const sanitized = sanitizeCampaignName(campaignName);
    const domain = body.domain?.trim() || undefined;
    const results: GeneratedLink[] = [];

    // We use per-link shortening in parallel to support retry semantics and
    // give the client a clear per-link status. Bounded concurrency avoids
    // hammering Short.io.
    const CONCURRENCY = 4;
    const queue = [...validCombos];

    async function worker() {
      while (queue.length > 0) {
        const combo = queue.shift();
        if (!combo) break;
        const full = buildUtmUrl(baseUrl, combo.source, combo.medium, sanitized);
        if (!body.apiKey || body.apiKey.trim() === '') {
          results.push({
            source: combo.source,
            medium: combo.medium,
            fullUtmUrl: full,
            shortUrl: null,
            status: 'success',
            attempts: 0,
          });
          continue;
        }
        const r = await shortenUrl(full, { apiKey: body.apiKey!.trim(), domain });
        results.push({
          source: combo.source,
          medium: combo.medium,
          fullUtmUrl: full,
          shortUrl: r.shortUrl,
          status: r.success ? 'success' : 'failed',
          error: r.error,
          attempts: 1,
        });
      }
    }

    await Promise.all(
      Array.from({ length: Math.min(CONCURRENCY, validCombos.length) }, () => worker())
    );

    return res.status(200).json({
      success: true,
      data_batch: results,
    });
  } catch (error: any) {
    console.error('Generate API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during link generation',
    });
  }
}
