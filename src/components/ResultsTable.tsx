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
    <div className="space-y-3">
      {results.map((result, index) => (
        <div key={index} className="bg-[#0c1e3e] rounded-xl p-4 border border-[#fbbf24]/10">
          <div className="flex justify-between items-start mb-2">
            <div>
              <div className="font-medium">{result.source} × {result.medium}</div>
              <div className="text-xs text-[#64748b] break-all">{result.fullUtmUrl}</div>
            </div>
            {result.shortUrl && (
              <button
                onClick={() => onCopy(result.shortUrl!, t('copied'))}
                className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition"
              >
                {copySuccess === t('copied') ? '✓' : t('copy')}
              </button>
            )}
          </div>
          {result.shortUrl && <div className="text-[#fbbf24] text-sm break-all">{result.shortUrl}</div>}
        </div>
      ))}
    </div>
  );
}
