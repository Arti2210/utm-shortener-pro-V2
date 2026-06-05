import React from 'react';
import Image from 'next/image';
import { useAppStore } from '../store/appStore';
import { Language } from '../i18n/translations';

interface HeaderProps {
  onOpenSettings: () => void;
  language: Language;
}

export default function Header({ onOpenSettings, language }: HeaderProps) {
  const theme = useAppStore((s) => s.theme);
  const setTheme = useAppStore((s) => s.setTheme);
  const setLanguage = useAppStore((s) => s.setLanguage);

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-ink-800/80 backdrop-blur-md border-b border-ink-200 dark:border-ink-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <a href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 relative transition-transform group-hover:scale-105">
              <Image
                src="/logo.svg"
                alt="YS Logo"
                width={40}
                height={40}
                className="object-contain"
                priority
              />
            </div>
            <span className="font-bold text-lg sm:text-xl tracking-tight text-ink-900 dark:text-white hidden sm:inline">
              UTM Shortener <span className="text-teal-700 dark:text-teal-300">Pro</span>
            </span>
          </a>

          <div className="flex items-center gap-2">
            {/* Language switcher (compact) */}
            <div className="hidden sm:flex items-center rounded-lg border border-ink-200 dark:border-ink-700 overflow-hidden">
              <button
                onClick={() => setLanguage('uk')}
                aria-label="Українська"
                className={`px-2.5 py-1.5 text-xs font-semibold transition ${
                  language === 'uk'
                    ? 'bg-teal-700 text-white'
                    : 'text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700'
                }`}
              >
                UK
              </button>
              <button
                onClick={() => setLanguage('en')}
                aria-label="English"
                className={`px-2.5 py-1.5 text-xs font-semibold transition ${
                  language === 'en'
                    ? 'bg-teal-700 text-white'
                    : 'text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700'
                }`}
              >
                EN
              </button>
            </div>

            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label="Toggle theme"
              className="p-2 rounded-lg border border-ink-200 dark:border-ink-700 text-ink-600 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700 transition"
            >
              {theme === 'dark' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>

            {/* Settings */}
            <button
              onClick={onOpenSettings}
              className="px-3 sm:px-4 py-2 rounded-lg bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white text-sm font-semibold transition flex items-center gap-2 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="hidden sm:inline">{t_label(language)}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

function t_label(lang: Language) {
  return lang === 'uk' ? 'Налаштування' : 'Settings';
}
