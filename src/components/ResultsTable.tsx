import React from 'react';
import { GeneratedLink } from '../store/appStore';

interface ResultsTableProps {
  results: GeneratedLink[];
  onCopy: (text: string, label: string) => void;
  copySuccess: string | null;
  t: (key: any) => string;
}

export default function ResultsTable({ results, onCopy, copySuccess, t }: ResultsTableProps) {
  if (results.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-[#64748b]">
        {t('noResults')}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#fbbf24]/20">
              <th className="text-left px-4 py-3 text-[#fbbf24] font-semibold text-sm">{t('platform')}</th>
              <th className="text-left px-4 py-3 text-[#fbbf24] font-semibold text-sm">{t('placement')}</th>
              <th className="text-left px-4 py-3 text-[#fbbf24] font-semibold text-sm">{t('fullLink')}</th>
              <th className="text-left px-4 py-3 text-[#fbbf24] font-semibold text-sm">{t('shortLink')}</th>
              <th className="text-center px-4 py-3 text-[#fbbf24] font-semibold text-sm">{t('copy')}</th>
            </tr>
          </thead>
          <tbody>
            {results.map((result, index) => (
              <tr key={index} className="border-b border-[#fbbf24]/10 hover:bg-[#0c1e3e]/50 transition">
                <td className="px-4 py-3 text-sm font-medium text-white">{result.source}</td>
                <td className="px-4 py-3 text-sm text-white">{result.medium}</td>
                <td className="px-4 py-3 text-xs text-[#64748b] break-all max-w-xs">
                  <code className="bg-[#0c1e3e] px-2 py-1 rounded">{result.fullUtmUrl}</code>
                </td>
                <td className="px-4 py-3 text-sm text-[#fbbf24] break-all max-w-xs">
                  {result.shortUrl ? (
                    <code className="bg-[#0c1e3e] px-2 py-1 rounded">{result.shortUrl}</code>
                  ) : (
                    <span className="text-[#64748b]">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  {result.shortUrl && (
                    <button
                      onClick={() => onCopy(result.shortUrl!, t('copied'))}
                      className="px-3 py-1 bg-[#fbbf24]/20 hover:bg-[#fbbf24]/30 text-[#fbbf24] rounded text-xs font-medium transition"
                    >
                      {copySuccess === t('copied') ? '✓' : t('copy')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-2 pt-4">
        <button
          onClick={() => {
            const allUrls = results.map(r => r.shortUrl || r.fullUtmUrl).join('\n');
            onCopy(allUrls, t('copyAll'));
          }}
          className="flex-1 px-4 py-2 bg-[#fbbf24] text-[#0c1e3e] rounded-lg font-semibold hover:bg-[#fcd34d] transition"
        >
          {t('copyAll')}
        </button>
      </div>
    </div>
  );
}
