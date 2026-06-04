import type { NextApiRequest, NextApiResponse } from 'next';

interface SettingsResponse {
  success: boolean;
  message?: string;
  data?: {
    theme?: string;
    language?: string;
    hasApiKey?: boolean;
  };
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SettingsResponse>
) {
  if (req.method === 'GET') {
    return res.status(200).json({
      success: true,
      data: {
        theme: 'dark',
        language: 'uk',
        hasApiKey: false,
      },
    });
  }

  if (req.method === 'POST') {
    const { theme, language } = req.body;

    return res.status(200).json({
      success: true,
      message: 'Settings updated (client-side persistence active)',
      data: {
        theme: theme || 'dark',
        language: language || 'uk',
        hasApiKey: false,
      },
    });
  }

  return res.status(405).json({ success: false, message: 'Method not allowed' });
}
