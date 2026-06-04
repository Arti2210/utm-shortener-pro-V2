import type { NextApiRequest, NextApiResponse } from 'next';

interface UserSettings {
  theme: 'light' | 'dark';
  language: 'uk' | 'en';
  tinyUrlApiKey?: string;
}

interface SettingsResponse {
  success: boolean;
  data?: UserSettings;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SettingsResponse>
) {
  // This is a placeholder for user settings management
  // In production, this would interact with the database and session management

  if (req.method === 'GET') {
    // Get user settings from session/database
    return res.status(200).json({
      success: true,
      data: {
        theme: 'dark',
        language: 'uk',
      },
    });
  }

  if (req.method === 'POST') {
    // Update user settings
    const { theme, language, tinyUrlApiKey } = req.body;

    // Validate inputs
    if (theme && !['light', 'dark'].includes(theme)) {
      return res.status(400).json({ success: false, error: 'Invalid theme' });
    }

    if (language && !['uk', 'en'].includes(language)) {
      return res.status(400).json({ success: false, error: 'Invalid language' });
    }

    // Update in database (placeholder)
    return res.status(200).json({
      success: true,
      data: {
        theme: theme || 'dark',
        language: language || 'uk',
      },
    });
  }

  return res.status(405).json({ success: false, error: 'Method not allowed' });
}
