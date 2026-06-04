import React from 'react';
import { HistoryItem } from '../store/appStore';

interface HistoryPanelProps {
  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
  t: (key: any) => string;
}

export default function HistoryPanel({ history, onLoadHistory, t }: HistoryPanelProps) {
  if (history.length === 0) {
    return <div className="text-[#64748b] text-sm">{t('noHistory')}</div>;
  }

  return (
    <div className="space-y-3 max-h-[300px] overflow-auto pr-2">
      {history.map((item) => (
        <div
          key={item.id}
          onClick={() => onLoadHistory(item)}
          className="bg-[#0c1e3e] hover:bg-[#1a2d5a] cursor-pointer rounded-xl p-4 border border-[#fbbf24]/10 transition"
        >
          <div className="font-medium text-sm mb-1">{item.campaignName}</div>
          <div className="text-xs text-[#64748b]">{item.count} {t('links')}</div>
        </div>
      ))}
    </div>
  );
}
