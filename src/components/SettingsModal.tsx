import React from 'react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: any) => string;
}

export default function SettingsModal({ isOpen, onClose, t }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50" onClick={onClose}>
      <div
        className="bg-[#1a2d5a] rounded-2xl p-8 w-full max-w-md mx-4 border border-[#fbbf24]/20"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-semibold mb-6">{t('settingsTitle')}</h2>

        <div className="space-y-4 text-sm text-[#cbd5e1]">
          <p>{t('settingsNote')}</p>
          <p className="text-xs text-[#64748b]">{t('settingsPersistence')}</p>
        </div>

        <button
          onClick={onClose}
          className="mt-8 w-full py-3 bg-[#fbbf24] text-[#0c1e3e] font-semibold rounded-xl hover:bg-[#f59e0b] transition"
        >
          {t('close')}
        </button>
      </div>
    </div>
  );
}
