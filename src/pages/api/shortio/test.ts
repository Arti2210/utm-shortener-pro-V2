import type { NextApiRequest, NextApiResponse } from 'next';

interface TestBody {
  apiKey?: string;
  domain?: string;
}

/**
 * Probes the user's Short.io credentials by attempting to shorten a
 * throwaway URL. Runs server-side, so it bypasses Short.io's missing
 * Access-Control-Allow-Origin header (which causes browser fetches to
 * fail with a CORS error).
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ ok: boolean; status?: number; shortURL?: string; error?: string; message?: string }>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed' });
  }

  const { apiKey, domain } = (req.body || {}) as TestBody;

  if (!apiKey || !apiKey.trim()) {
    return res.status(400).json({ ok: false, error: 'API key is required' });
  }
  if (!domain || !domain.trim()) {
    return res.status(400).json({ ok: false, error: 'Domain is required' });
  }

  try {
    const upstream = await fetch('https://api.short.io/links', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: apiKey.trim(),
      },
      body: JSON.stringify({
        originalURL: 'https://example.com',
        domain: domain.trim(),
      }),
    });

    const data: any = await upstream.json().catch(() => null);

    if (upstream.ok && data?.shortURL) {
      return res.status(200).json({ ok: true, status: upstream.status, shortURL: data.shortURL });
    }

    return res.status(upstream.status).json({
      ok: false,
      status: upstream.status,
      error: data?.message || data?.error || 'Upstream rejected the request',
      message:
        upstream.status === 401 || upstream.status === 403
          ? 'Invalid API key or the key does not have permission for this domain'
          : upstream.status === 422
          ? 'Domain is not registered / verified in this Short.io account'
          : 'Short.io rejected the request',
    });
  } catch (e: any) {
    return res.status(500).json({ ok: false, error: e?.message || 'Network error reaching Short.io' });
  }
}
