import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useAppStore, GeneratedLink, HistoryItem } from '../store/appStore';
import { getTranslation } from '../i18n/translations';
import { isValidUrl, sanitizeCampaignName } from '../utils/utm';

// Components
import Header from '../components/Header';
import FormSection from '../components/FormSection';
import MatrixSelector from '../components/MatrixSelector';
import ResultsTable from '../components/ResultsTable';
import HistoryPanel from '../components/HistoryPanel';
import SettingsModal from '../components/SettingsModal';

interface Toast {
  id: number;
  type: 'success' | 'error' | 'info';
  message: string;
}

const MAX_RETRIES = 3;
const RETRY_BACKOFF_MS = 600;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function shortenWithRetry(
  url: string,
  apiKey: string,
  onUpdate: (patch: Partial<GeneratedLink>) => void,
  signal?: AbortSignal
) {
  let lastError: string | undefined = undefined;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    if (signal?.aborted) {
      onUpdate({ status: 'failed', error: 'Cancelled', attempts: attempt });
      return;
    }
    onUpdate({ status: 'pending', attempts: attempt });
    try {
      const res = await fetch('/api/links/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, apiKey }),
        signal,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        lastError = data?.error || `HTTP ${res.status}`;
        if (res.status === 401 || res.status === 403) {
          onUpdate({ status: 'failed', error: lastError ?? 'Auth error', attempts: attempt });
          return;
        }
      } else {
        const data = await res.json();
        if (data?.success && data?.data?.shortUrl) {
          onUpdate({
            status: 'success',
            shortUrl: data.data.shortUrl,
            error: undefined,
            attempts: attempt,
          });
          return;
        }
        lastError = data?.error || 'Unknown error';
      }
    } catch (e: any) {
      if (e?.name === 'AbortError') {
        onUpdate({ status: 'failed', error: 'Cancelled', attempts: attempt });
        return;
      }
      lastError = e?.message || 'Network error';
    }
    if (attempt < MAX_RETRIES) {
      await sleep(RETRY_BACKOFF_MS * attempt);
    }
  }
  onUpdate({ status: 'failed', error: lastError ?? 'Failed', attempts: MAX_RETRIES });
}

export default function UTMShortenerPro() {
  const {
    language,
    theme,
    tinyUrlApiKey,
    baseUrl,
    campaignName,
    selectedCells,
    currentResults,
    isGenerating,
    error,
    history,
    isSettingsOpen,
    setBaseUrl,
    setCampaignName,
    setCurrentResults,
    setIsGenerating,
    setError,
    addToHistory,
    openSettings,
    closeSettings,
    getFilteredHistory,
    getSelectedCombinationsCount,
    updateResult,
  } = useAppStore();

  const t = useCallback(
    (key: any) => getTranslation(language, key),
    [language]
  );

  // Apply theme to <html> on mount and on change
  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    document.documentElement.lang = language;
  }, [theme, language]);

  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ baseUrl?: string; campaign?: string }>({});

  const filteredHistory = useMemo(() => getFilteredHistory(), [history, getFilteredHistory]);
  const combinationsCount = getSelectedCombinationsCount();

  const showToast = useCallback((type: Toast['type'], message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 3500);
  }, []);

  const urlError = useMemo(() => {
    if (!baseUrl) return null;
    return isValidUrl(baseUrl) ? null : t('invalidUrl');
  }, [baseUrl, t]);

  const campaignError = useMemo(() => {
    if (!campaignName) return null;
    const sanitized = sanitizeCampaignName(campaignName);
    return sanitized ? null : t('campaignRequired');
  }, [campaignName, t]);

  const combinations = useMemo(
    () => selectedCells.map((c) => ({ source: c.platform, medium: c.placement })),
    [selectedCells]
  );

  const canGenerate =
    baseUrl.trim() !== '' &&
    campaignName.trim() !== '' &&
    selectedCells.length > 0 &&
    !urlError &&
    !campaignError;

  const buildUtmUrl = (base: string, source: string, medium: string, campaign: string) => {
    const cleanBase = base.trim().replace(/\/$/, '');
    const params = new URLSearchParams();
    params.set('utm_source', source);
    params.set('utm_medium', medium);
    params.set('utm_campaign', sanitizeCampaignName(campaign));
    return `${cleanBase}?${params.toString()}`;
  };

  const handleGenerate = async () => {
    if (!canGenerate) {
      const errs: { baseUrl?: string; campaign?: string } = {};
      if (!baseUrl.trim()) errs.baseUrl = t('urlRequired');
      else if (urlError) errs.baseUrl = urlError;
      if (!campaignName.trim()) errs.campaign = t('campaignRequired');
      else if (campaignError) errs.campaign = campaignError;
      setFieldErrors(errs);
      if (selectedCells.length === 0) {
        setError(t('selectAtLeastOne'));
      }
      return;
    }
    setFieldErrors({});
    setIsGenerating(true);
    setError(null);

    const sanitizedCampaign = sanitizeCampaignName(campaignName);
    const initial: GeneratedLink[] = combinations.map(({ source, medium }) => ({
      source,
      medium,
      fullUtmUrl: buildUtmUrl(baseUrl, source, medium, sanitizedCampaign),
      shortUrl: null,
      status: 'pending' as const,
      attempts: 0,
    }));
    setCurrentResults(initial);

    if (!tinyUrlApiKey) {
      // No API key — just keep full URLs as "success" so user can copy
      const updated = initial.map((r) => ({ ...r, status: 'success' as const }));
      setCurrentResults(updated);
      addToHistory({
        campaignName: sanitizedCampaign,
        baseUrl: baseUrl.trim(),
        results: updated,
        count: updated.length,
      });
      setIsGenerating(false);
      showToast('info', t('noApiKeyWarning'));
      return;
    }

    // Process sequentially with retry
    for (const r of [...initial]) {
      await shortenWithRetry(r.fullUtmUrl, tinyUrlApiKey, (patch) => {
        updateResult(r.source, r.medium, patch);
      });
    }

    // Read latest results from store to add to history
    const finalResults = useAppStore.getState().currentResults;
    addToHistory({
      campaignName: sanitizedCampaign,
      baseUrl: baseUrl.trim(),
      results: finalResults,
      count: finalResults.length,
    });
    setIsGenerating(false);

    const failed = finalResults.filter((r) => r.status === 'failed').length;
    const success = finalResults.filter((r) => r.status === 'success').length;
    if (failed === 0) {
      showToast('success', `${t('allCopied')}: ${success}`);
    } else if (success > 0) {
      showToast('info', `${success} ok, ${failed} ${t('error').toLowerCase()}`);
    } else {
      showToast('error', t('networkError'));
    }
  };

  const handleRetryFailed = async () => {
    const failed = useAppStore.getState().currentResults.filter((r) => r.status === 'failed');
    if (failed.length === 0 || isRetrying) return;
    setIsRetrying(true);
    setError(null);
    for (const r of failed) {
      await shortenWithRetry(r.fullUtmUrl, tinyUrlApiKey, (patch) => {
        updateResult(r.source, r.medium, patch);
      });
    }
    setIsRetrying(false);
    const finalResults = useAppStore.getState().currentResults;
    const stillFailed = finalResults.filter((r) => r.status === 'failed').length;
    if (stillFailed === 0) {
      showToast('success', t('allCopied'));
    } else {
      showToast('error', `${stillFailed} ${t('error').toLowerCase()}`);
    }
  };

  const handleCopy = async (text: string, _label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', t('copied'));
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-9999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        showToast('success', t('copied'));
      } catch {
        showToast('error', 'Copy failed');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleCopyAllShorts = async () => {
    const shortUrls = currentResults
      .filter((r) => r.shortUrl)
      .map((r) => r.shortUrl)
      .filter(Boolean)
      .join('\n');
    if (shortUrls) {
      await handleCopy(shortUrls, t('allCopied'));
    } else {
      showToast('error', 'No short URLs available to copy');
    }
  };

  const handleLoadHistory = (item: HistoryItem) => {
    useAppStore.getState().loadFromHistory(item);
    const el = document.getElementById('results-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleClearAll = () => {
    if (confirm(language === 'uk' ? 'Очистити всю історію?' : 'Clear all history?')) {
      useAppStore.getState().clearHistory();
      showToast('info', t('clearHistory'));
    }
  };

  return (
    <div className="min-h-screen bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-white">
      <Head>
        <title>{t('appName')} | Professional UTM Builder</title>
        <meta name="description" content={t('tagline')} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <Header onOpenSettings={openSettings} language={language} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="text-center mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-2 sm:mb-3">
            {t('appName')}
          </h1>
          <p className="text-base sm:text-lg text-ink-500 dark:text-ink-300 max-w-2xl mx-auto">
            {t('tagline')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
          {/* Left column */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <section className="bg-white dark:bg-ink-800 rounded-2xl p-5 sm:p-8 shadow-sm border border-ink-200 dark:border-ink-700">
              <h2 className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 flex items-center gap-3">
                <span className="text-copper-500 font-bold">1.</span>
                {t('formTitle')}
              </h2>
              <FormSection
                baseUrl={baseUrl}
                campaignName={campaignName}
                onBaseUrlChange={setBaseUrl}
                onCampaignChange={setCampaignName}
                error={error}
                fieldErrors={fieldErrors}
                urlError={urlError}
                campaignError={campaignError}
                t={t}
              />
            </section>

            <section className="bg-white dark:bg-ink-800 rounded-2xl p-5 sm:p-8 shadow-sm border border-ink-200 dark:border-ink-700">
              <h2 className="text-xl sm:text-2xl font-semibold mb-5 sm:mb-6 flex items-center gap-3">
                <span className="text-copper-500 font-bold">2.</span>
                {t('matrixTitle')}
              </h2>
              <MatrixSelector combinationsCount={combinationsCount} t={t} />
            </section>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className="px-8 sm:px-12 py-3.5 sm:py-4 text-base sm:text-lg font-semibold rounded-xl bg-gradient-to-r from-copper-500 to-copper-600 hover:from-copper-600 hover:to-copper-700 text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('generating')}
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {t('generateLinks')}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <section
              id="results-section"
              className="bg-white dark:bg-ink-800 rounded-2xl p-5 sm:p-8 shadow-sm border border-ink-200 dark:border-ink-700 min-h-[420px]"
            >
              <div className="flex items-center justify-between mb-5 sm:mb-6 gap-3">
                <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-3">
                  <span className="text-copper-500 font-bold">3.</span>
                  {t('resultsTitle')}
                </h2>
                {currentResults.some((r) => r.shortUrl) && (
                  <button
                    onClick={handleCopyAllShorts}
                    className="text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg bg-teal-700/10 hover:bg-teal-700/20 text-teal-700 dark:text-teal-300 border border-teal-700/30 transition flex items-center gap-1.5 font-medium whitespace-nowrap"
                  >
                    📋 {t('copyAll')}
                  </button>
                )}
              </div>
              <ResultsTable
                results={currentResults}
                onCopy={handleCopy}
                copySuccess={null}
                t={t}
                onRetryFailed={handleRetryFailed}
                isRetrying={isRetrying}
              />
            </section>

            <section className="bg-white dark:bg-ink-800 rounded-2xl p-5 sm:p-8 shadow-sm border border-ink-200 dark:border-ink-700">
              <div className="flex items-center justify-between mb-5 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-semibold flex items-center gap-3">
                  {t('historyTitle')}
                </h2>
                {filteredHistory.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs sm:text-sm text-red-500 hover:text-red-400 transition font-medium"
                  >
                    {t('clearHistory')}
                  </button>
                )}
              </div>
              <HistoryPanel
                history={filteredHistory}
                onLoadHistory={handleLoadHistory}
                t={t}
              />
            </section>
          </div>
        </div>

        <footer className="mt-10 sm:mt-12 text-center text-xs sm:text-sm text-ink-400 dark:text-ink-500 px-4">
          {t('expiresIn')} {t('week')}.{' '}
          {language === 'uk'
            ? 'Дані зберігаються тільки у вашому браузері. '
            : 'Data is stored locally in your browser. '}
          <button
            onClick={openSettings}
            className="underline hover:text-teal-700 dark:hover:text-teal-300 transition"
          >
            {t('settings')}
          </button>
        </footer>
      </main>

      <SettingsModal isOpen={isSettingsOpen} onClose={closeSettings} t={t} />

      {/* Toast notifications */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl shadow-2xl flex items-center gap-2 text-sm font-medium animate-slide-up ${
              toast.type === 'success'
                ? 'bg-teal-700 text-white'
                : toast.type === 'error'
                ? 'bg-red-500 text-white'
                : 'bg-ink-800 text-white border border-ink-700'
            }`}
            role="status"
          >
            {toast.type === 'success' && '✓'}
            {toast.type === 'error' && '✕'}
            {toast.type === 'info' && 'ℹ'}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  );
}
