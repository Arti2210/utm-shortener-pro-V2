import React, { useState } from 'react';
import {
  PLATFORMS,
  MEDIUMS,
  isValidCombination,
  GeneratedLink,
} from '../store/appStore';

interface ResultsTableProps {
  results: GeneratedLink[];
  onCopy: (text: string, label: string) => void;
  copySuccess: string | null;
  t: (key: any) => string;
  onRetryFailed: () => void;
  isRetrying: boolean;
}

function statusBadge(status: GeneratedLink['status']) {
  if (status === 'success') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
        OK
      </span>
    );
  }
  if (status === 'pending') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-copper-500/15 text-copper-600 dark:text-copper-300 border border-copper-500/30">
        <span className="w-1.5 h-1.5 rounded-full bg-copper-500 animate-pulse" />
        ...
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-600 dark:text-red-300 border border-red-500/30">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      FAIL
    </span>
  );
}

export default function ResultsTable({
  results,
  onCopy,
  copySuccess,
  t,
  onRetryFailed,
  isRetrying,
}: ResultsTableProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const failedCount = results.filter((r) => r.status === 'failed').length;
  const successCount = results.filter((r) => r.status === 'success').length;

  const handleCopy = (text: string, key: string) => {
    onCopy(text, key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  // Build a quick lookup for cell rendering
  const resultMap = new Map<string, GeneratedLink>();
  results.forEach((r) => resultMap.set(`${r.source}|${r.medium}`, r));

  if (results.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-ink-400 dark:text-ink-400 text-center px-4">
        <svg className="w-12 h-12 mb-3 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
        <p className="text-sm">{t('noResults')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="inline-flex items-center gap-1.5 text-ink-500 dark:text-ink-300">
          <span className="w-2 h-2 rounded-full bg-teal-500" />
          {t('success')}: <strong className="text-teal-700 dark:text-teal-300">{successCount}</strong>
        </span>
        {failedCount > 0 && (
          <span className="inline-flex items-center gap-1.5 text-ink-500 dark:text-ink-300">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            {t('error')}: <strong className="text-red-600 dark:text-red-300">{failedCount}</strong>
          </span>
        )}
        {failedCount > 0 && (
          <button
            onClick={onRetryFailed}
            disabled={isRetrying}
            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-copper-500/15 text-copper-600 dark:text-copper-300 border border-copper-500/30 hover:bg-copper-500/25 text-xs font-semibold transition"
          >
            {isRetrying ? (
              <>
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {t('retrying')}
              </>
            ) : (
              <>↻ {t('retryFailed')}</>
            )}
          </button>
        )}
      </div>

      <div className="overflow-x-auto rounded-xl border border-ink-200 dark:border-ink-700">
        <table className="w-full border-collapse min-w-[680px]">
          <thead>
            <tr>
              <th className="p-3 text-xs font-semibold text-left text-ink-500 dark:text-ink-300 bg-ink-50 dark:bg-ink-800 border-b border-r border-ink-200 dark:border-ink-700">
                ↓ {t('platform')} / {t('medium')} →
              </th>
              {MEDIUMS.map((m) => (
                <th
                  key={m.code}
                  className="p-3 text-xs font-semibold text-teal-700 dark:text-teal-300 bg-ink-50 dark:bg-ink-800 border-b border-ink-200 dark:border-ink-700 whitespace-nowrap"
                >
                  {m.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PLATFORMS.map((p) => (
              <tr key={p.code}>
                <th className="p-3 text-xs font-semibold text-left text-ink-700 dark:text-ink-100 bg-ink-50/60 dark:bg-ink-800/60 border-r border-ink-200 dark:border-ink-700 whitespace-nowrap">
                  {p.name}
                </th>
                {MEDIUMS.map((m) => {
                  const valid = isValidCombination(p.code, m.code);
                  const result = resultMap.get(`${p.code}|${m.code}`);

                  return (
                    <td
                      key={`${p.code}-${m.code}`}
                      className="p-2 border-t border-ink-200 dark:border-ink-700 align-top"
                    >
                      {!valid ? (
                        <div className="h-20 flex items-center justify-center text-xs text-ink-300 dark:text-ink-600">
                          —
                        </div>
                      ) : !result ? (
                        <div className="h-20 flex items-center justify-center text-xs text-ink-400 dark:text-ink-500">
                          — 
                        </div>
                      ) : (
                        <div className="space-y-1.5 min-h-[80px]">
                          <div className="flex items-center justify-between">
                            {statusBadge(result.status)}
                            {result.status === 'failed' && result.attempts > 1 && (
                              <span className="text-[10px] text-ink-400">
                                ×{result.attempts}
                              </span>
                            )}
                          </div>
                          {result.status === 'success' && result.shortUrl ? (
                            <a
                              href={result.shortUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-[11px] text-teal-700 dark:text-teal-300 hover:text-copper-500 break-all leading-tight"
                              title={result.shortUrl}
                            >
                              {result.shortUrl.replace(/^https?:\/\//, '')}
                            </a>
                          ) : result.status === 'failed' ? (
                            <p className="text-[10px] text-red-500 dark:text-red-400 break-all">
                              {result.error || t('shortenFailed')}
                            </p>
                          ) : (
                            <p className="text-[11px] text-ink-400">…</p>
                          )}
                          {result.status === 'success' && result.shortUrl && (
                            <button
                              onClick={() =>
                                handleCopy(result.shortUrl!, `${p.code}-${m.code}`)
                              }
                              className="w-full text-[10px] px-2 py-1 rounded bg-teal-700/10 hover:bg-teal-700/20 text-teal-700 dark:text-teal-300 border border-teal-700/30 transition font-medium"
                            >
                              {copiedKey === `${p.code}-${m.code}`
                                ? `✓ ${t('copied')}`
                                : t('copy')}
                            </button>
                          )}
                          {result.status === 'failed' && (
                            <a
                              href={result.fullUtmUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-[10px] text-copper-600 dark:text-copper-300 hover:underline break-all"
                              title={t('copyFull')}
                            >
                              {t('copyFull')} →
                            </a>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {copySuccess && copySuccess !== 'true' && !copiedKey && (
        <div className="text-xs text-center text-teal-700 dark:text-teal-300">
          ✓ {t('allCopied')}
        </div>
      )}
    </div>
  );
}
