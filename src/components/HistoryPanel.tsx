import React from 'react';
import { HistoryItem } from '../store/appStore';

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
  onClearHistory?: () => void;
  t: (key: any) => string;
}

export default function HistoryPanel({ history, onLoadHistory, onClearHistory, t }: HistoryPanelProps) {
  if (history.length === 0) {
    return <div className="text-[#64748b] text-sm">{t('noHistory')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-[#fbbf24]/20">
              <th className="text-left px-4 py-3 text-[#fbbf24] font-semibold text-sm">{t('campaignName')}</th>
              <th className="text-left px-4 py-3 text-[#fbbf24] font-semibold text-sm">{t('baseUrl')}</th>
              <th className="text-center px-4 py-3 text-[#fbbf24] font-semibold text-sm">Посилань</th>
              <th className="text-center px-4 py-3 text-[#fbbf24] font-semibold text-sm">{t('generatedAt')}</th>
              <th className="text-center px-4 py-3 text-[#fbbf24] font-semibold text-sm">Дія</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id} className="border-b border-[#fbbf24]/10 hover:bg-[#0c1e3e]/50 transition">
                <td className="px-4 py-3 text-sm font-medium text-white">{item.campaignName}</td>
                <td className="px-4 py-3 text-xs text-[#64748b] break-all max-w-xs">
                  <code className="bg-[#0c1e3e] px-2 py-1 rounded">{item.baseUrl}</code>
                </td>
                <td className="px-4 py-3 text-center text-sm text-[#fbbf24] font-semibold">
                  {item.count || 0}
                </td>
                <td className="px-4 py-3 text-center text-xs text-[#64748b]">
                  {new Date(item.timestamp).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => onLoadHistory(item)}
                    className="px-3 py-1 bg-[#fbbf24]/20 hover:bg-[#fbbf24]/30 text-[#fbbf24] rounded text-xs font-medium transition"
                  >
                    {t('load') || 'Load'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {onClearHistory && (
        <button
          onClick={onClearHistory}
          className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg font-semibold transition"
        >
          {t('clearHistory')}
        </button>
      )}
    </div>
  );
}
