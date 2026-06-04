import type { NextApiRequest, NextApiResponse } from 'next';
import { generateCombinations, isValidUrl, sanitizeCampaignName } from '../../../utils/utm';
import { shortenUrl, batchShortenUrls } from '../../../utils/tinyurl';
import { GeneratedLink } from '../../../store/appStore';

interface GenerateRequestBody {
  baseUrl: string;
  campaignName: string;
  combinations?: Array<{ source: string; medium: string }>;
  selectedPlatforms?: string[];
  selectedMediums?: string[];
  apiKey?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ success: boolean; data?: GeneratedLink[]; error?: string; message?: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const {
      baseUrl,
      campaignName,
      combinations,
      selectedPlatforms,
      selectedMediums,
      apiKey,
    }: GenerateRequestBody = req.body;

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

    let finalCombinations: Array<{ source: string; medium: string }> = [];

    if (combinations && combinations.length > 0) {
      finalCombinations = combinations;
    } else if (selectedPlatforms && selectedMediums) {
      for (const source of selectedPlatforms) {
        for (const medium of selectedMediums) {
          finalCombinations.push({ source, medium });
        }
      }
    }

    if (finalCombinations.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No platform/medium combinations provided.',
      });
    }

    if (finalCombinations.length > 50) {
      return res.status(400).json({
        success: false,
        error: 'Too many combinations (max 50 allowed per request).',
      });
    }

    const utmLinks = generateCombinations(
      baseUrl,
      campaignName,
      finalCombinations.map(c => c.source),
      finalCombinations.map(c => c.medium)
    );

    const results: GeneratedLink[] = [];
    const hasApiKey = apiKey && apiKey.trim().length > 10;

    if (hasApiKey) {
      const longUrls = utmLinks.map(item => item.fullUtmUrl);
      const shortenResults = await batchShortenUrls(longUrls, apiKey.trim());

      utmLinks.forEach((item, index) => {
        const shortenResult = shortenResults[index];
        results.push({
          source: item.source,
          medium: item.medium,
          fullUtmUrl: item.fullUtmUrl,
          shortUrl: shortenResult.success ? shortenResult.shortUrl : null,
          status: shortenResult.success ? 'success' : 'error',
          error: shortenResult.error,
        });
      });
    } else {
      utmLinks.forEach((item) => {
        results.push({
          source: item.source,
          medium: item.medium,
          fullUtmUrl: item.fullUtmUrl,
          shortUrl: null,
          status: 'success',
          error: 'No TinyURL API key provided - short URL not generated',
        });
      });
    }

    return res.status(200).json({
      success: true,
      data: results,
    });
  } catch (error: any) {
    console.error('Generate API error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error during link generation',
    });
  }
}
