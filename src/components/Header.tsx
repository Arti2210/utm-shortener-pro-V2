import React from 'react';
import { Language } from '../i18n/translations';

interface HeaderProps {
  onOpenSettings: () => void;
  language: Language;
}

export default function Header({ onOpenSettings, language }: HeaderProps) {
  return (
    <header className="bg-[#1a2d5a] border-b border-[#fbbf24]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#fbbf24] rounded-lg flex items-center justify-center">
              <span className="text-[#0c1e3e] font-bold text-xl">⊕</span>
            </div>
            <span className="font-semibold text-xl tracking-tight">UTM Shortener Pro</span>
          </div>

          <button
            onClick={onOpenSettings}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition flex items-center gap-2 text-sm"
          >
            ⚙️ {language === 'uk' ? 'Налаштування' : 'Settings'}
          </button>
        </div>
      </div>
    </header>
  );
}
