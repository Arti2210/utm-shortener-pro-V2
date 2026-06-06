import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/appStore';
import { Language } from '../i18n/translations';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  t: (key: any) => string;
}

export default function SettingsModal({ isOpen, onClose, t }: SettingsModalProps) {
  const language = useAppStore((s) => s.language);
  const theme = useAppStore((s) => s.theme);
  const shortIoApiKey = useAppStore((s) => s.shortIoApiKey);
  const shortIoDomain = useAppStore((s) => s.shortIoDomain);
  const setLanguage = useAppStore((s) => s.setLanguage);
  const setTheme = useAppStore((s) => s.setTheme);
  const setShortIoApiKey = useAppStore((s) => s.setShortIoApiKey);
  const setShortIoDomain = useAppStore((s) => s.setShortIoDomain);

  const [apiKeyInput, setApiKeyInput] = useState(shortIoApiKey);
  const [domainInput, setDomainInput] = useState(shortIoDomain);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setApiKeyInput(shortIoApiKey);
      setDomainInput(shortIoDomain);
      setTestResult(null);
      setSaved(false);
    }
  }, [isOpen, shortIoApiKey, shortIoDomain]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSave = () => {
    setShortIoApiKey(apiKeyInput.trim());
    setShortIoDomain(domainInput.trim() || 'arti.s.gy');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleTest = async () => {
    if (!apiKeyInput.trim()) {
      setTestResult('error');
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch('https://api.short.io/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: apiKeyInput.trim(),
        },
        body: JSON.stringify({
          originalURL: 'https://example.com',
          domain: domainInput.trim() || 'arti.s.gy',
        }),
      });
      setTestResult(res.ok ? 'success' : 'error');
    } catch {
      setTestResult('error');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-ink-800 rounded-2xl p-6 sm:p-8 w-full max-w-md border border-ink-200 dark:border-ink-700 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-ink-900 dark:text-white">
            {t('settingsTitle')}
          </h2>
          <button
            onClick={onClose}
            aria-label={t('close')}
            className="p-1.5 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-700 text-ink-500 dark:text-ink-300 transition"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-6">
          {/* Language */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-ink-700 dark:text-ink-100">
              {t('language')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['uk', 'en'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition ${
                    language === lang
                      ? 'bg-teal-700 border-teal-700 text-white shadow-sm'
                      : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-100 hover:border-teal-500'
                  }`}
                >
                  {lang === 'uk' ? '🇺🇦 Українська' : '🇬🇧 English'}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-ink-700 dark:text-ink-100">
              {t('theme')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTheme('dark')}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition flex items-center justify-center gap-2 ${
                  theme === 'dark'
                    ? 'bg-teal-700 border-teal-700 text-white shadow-sm'
                    : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-100 hover:border-teal-500'
                }`}
              >
                🌙 {t('dark')}
              </button>
              <button
                onClick={() => setTheme('light')}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition flex items-center justify-center gap-2 ${
                  theme === 'light'
                    ? 'bg-teal-700 border-teal-700 text-white shadow-sm'
                    : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-100 hover:border-teal-500'
                }`}
              >
                ☀️ {t('light')}
              </button>
            </div>
          </div>

          {/* Short.io API Key */}
          <div>
            <label
              htmlFor="api-key"
              className="block text-sm font-semibold mb-2 text-ink-700 dark:text-ink-100"
            >
              {t('shortIoApiKey')}
            </label>
            <input
              id="api-key"
              type="password"
              value={apiKeyInput}
              onChange={(e) => setApiKeyInput(e.target.value)}
              placeholder={t('apiKeyPlaceholder')}
              className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-white placeholder:text-ink-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              autoComplete="off"
            />
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-1.5">
              {t('apiKeyHint')}
            </p>
          </div>

          {/* Short.io Domain */}
          <div>
            <label
              htmlFor="api-domain"
              className="block text-sm font-semibold mb-2 text-ink-700 dark:text-ink-100"
            >
              {t('shortIoDomain')}
            </label>
            <input
              id="api-domain"
              type="text"
              value={domainInput}
              onChange={(e) => setDomainInput(e.target.value)}
              placeholder="arti.s.gy"
              className="w-full px-4 py-2.5 rounded-lg bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-700 text-ink-900 dark:text-white placeholder:text-ink-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition"
              autoComplete="off"
            />
            <p className="text-xs text-ink-500 dark:text-ink-400 mt-1.5">
              {t('shortIoDomainHint')}
            </p>
          </div>

          <button
            onClick={handleTest}
            disabled={testing || !apiKeyInput.trim()}
            className="text-xs px-3 py-1.5 rounded-md bg-copper-500/15 text-copper-600 dark:text-copper-300 border border-copper-500/30 hover:bg-copper-500/25 font-medium transition"
          >
            {testing ? t('testing') : t('testConnection')}
          </button>
          {testResult === 'success' && (
            <p className="text-xs text-teal-700 dark:text-teal-300">
              ✓ {t('connectionSuccess')}
            </p>
          )}
          {testResult === 'error' && (
            <p className="text-xs text-red-500 dark:text-red-400">
              ✗ {t('connectionError')}
            </p>
          )}
        </div>

        <div className="mt-8 flex flex-col-reverse sm:flex-row gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-100 hover:bg-ink-50 dark:hover:bg-ink-700 font-medium transition"
          >
            {t('close')}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-semibold transition shadow-sm"
          >
            {saved ? `✓ ${t('apiKeySaved')}` : t('saveSettings')}
          </button>
        </div>
      </div>
    </div>
  );
}
