import type { NextApiRequest, NextApiResponse } from 'next';
import { buildUtmUrl, generateUtmCombinations, isValidUrl, isValidCampaignName } from '@/utils/utm';
import { shortenUrlsBatch } from '@/utils/tinyurl';
import { v4 as uuidv4 } from 'uuid';

interface GenerateLinksRequest {
  baseUrl: string;
  campaignName: string;
  combinations: Array<{ source: string; medium: string }>;
  apiKey: string;
}

interface GenerateLinksResponse {
  success: boolean;
  data?: Array<{
    source: string;
    medium: string;
    fullUtmUrl: string;
    shortUrl?: string;
    status: 'success' | 'failed';
    error?: string;
  }>;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<GenerateLinksResponse>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const { baseUrl, campaignName, combinations, apiKey }: GenerateLinksRequest = req.body;

    // Validation
    if (!baseUrl || !isValidUrl(baseUrl)) {
      return res.status(400).json({ success: false, error: 'Invalid base URL' });
    }

    if (!campaignName || !isValidCampaignName(campaignName)) {
      return res.status(400).json({ success: false, error: 'Invalid campaign name' });
    }

    if (!combinations || combinations.length === 0) {
      return res.status(400).json({ success: false, error: 'No combinations selected' });
    }

    if (!apiKey) {
      return res.status(400).json({ success: false, error: 'API key is required' });
    }

    // Generate UTM URLs
    const utmUrls = generateUtmCombinations(baseUrl, campaignName, combinations);

    // Extract just the URLs for shortening
    const urlsToShorten = utmUrls.map((item) => item.utmUrl);

    // Shorten URLs using TinyURL
    const shortenedResults = await shortenUrlsBatch(urlsToShorten, apiKey);

    // Combine results
    const results = utmUrls.map((utm, index) => {
      const shortened = shortenedResults[index];
      return {
        source: utm.source,
        medium: utm.medium,
        fullUtmUrl: utm.utmUrl,
        shortUrl: shortened.shortUrl,
        status: shortened.error ? ('failed' as const) : ('success' as const),
        error: shortened.error?.message,
      };
    });

    return res.status(200).json({ success: true, data: results });
  } catch (error: any) {
    console.error('Error generating links:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error',
    });
  }
}
