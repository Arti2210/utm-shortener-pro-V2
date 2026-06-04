import React, { useState, useMemo } from 'react';
import Head from 'next/head';
import { useAppStore, PLATFORMS, MEDIUMS, GeneratedLink, HistoryItem } from '../store/appStore';
import { getTranslation } from '../i18n/translations';
import { isValidUrl, sanitizeCampaignName } from '../utils/utm';
import axios from 'axios';

// Components
import Header from '../components/Header';
import FormSection from '../components/FormSection';
import MatrixSelector from '../components/MatrixSelector';
import ResultsTable from '../components/ResultsTable';
import HistoryPanel from '../components/HistoryPanel';
import SettingsModal from '../components/SettingsModal';

export default function UTMShortenerPro() {
  const {
    language,
    theme,
    tinyUrlApiKey,
    baseUrl,
    campaignName,
    selectedPlatforms,
    selectedMediums,
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
    resetForm,
    getFilteredHistory,
    getSelectedCombinationsCount,
  } = useAppStore();

  const t = (key: any) => getTranslation(language, key);

  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  const filteredHistory = useMemo(() => getFilteredHistory(), [history, getFilteredHistory]);
  const combinationsCount = getSelectedCombinationsCount();

  const canGenerate =
    baseUrl.trim() !== '' &&
    campaignName.trim() !== '' &&
    selectedPlatforms.length > 0 &&
    selectedMediums.length > 0;

  const handleGenerate = async () => {
    if (!canGenerate) {
      setError(t('selectAtLeastOne'));
      return;
    }

    if (!isValidUrl(baseUrl)) {
      setError(t('invalidUrl'));
      return;
    }

    const sanitizedCampaign = sanitizeCampaignName(campaignName);
    if (!sanitizedCampaign) {
      setError(t('campaignRequired'));
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCopySuccess(null);

    try {
      const payload = {
        baseUrl: baseUrl.trim(),
        campaignName: sanitizedCampaign,
        selectedPlatforms,
        selectedMediums,
        apiKey: tinyUrlApiKey || undefined,
      };

      const response = await axios.post('/api/links/generate', payload, {
        timeout: 30000,
      });

      if (response.data.success && response.data.data) {
        const results: GeneratedLink[] = response.data.data;
        setCurrentResults(results);

        addToHistory({
          campaignName: sanitizedCampaign,
          baseUrl: baseUrl.trim(),
          results,
          count: results.length,
        });

        if (!tinyUrlApiKey) {
          setTimeout(() => {
            setError(t('noApiKeyWarning'));
          }, 800);
        }
      } else {
        setError(response.data.error || t('unknownError'));
      }
    } catch (err: any) {
      console.error('Generation failed:', err);
      if (err.code === 'ECONNABORTED') {
        setError('Request timeout. Please try again.');
      } else {
        setError(err.response?.data?.error || t('networkError'));
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch (e) {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(label);
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  const handleCopyAllShorts = async () => {
    const shortUrls = currentResults
      .filter(r => r.shortUrl)
      .map(r => r.shortUrl)
      .join('\n');

    if (shortUrls) {
      await handleCopy(shortUrls, t('allCopied'));
    } else {
      setError('No short URLs available to copy');
    }
  };

  const handleLoadHistory = (item: HistoryItem) => {
    const resultsEl = document.getElementById('results-section');
    if (resultsEl) {
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleClearAll = () => {
    if (confirm(language === 'uk' ? 'Очистити всю історію?' : 'Clear all history?')) {
      useAppStore.getState().clearHistory();
    }
  };

  return (
    <div className="min-h-screen bg-[#0c1e3e] dark:bg-[#0c1e3e] text-white transition-colors duration-300">
      <Head>
        <title>{t('appName')} | Professional UTM Builder</title>
      </Head>

      <Header
        onOpenSettings={openSettings}
        language={language}
        theme={theme}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
            {t('appName')}
          </h1>
          <p className="text-xl text-[#cbd5e1] max-w-2xl mx-auto">
            {t('tagline')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left column */}
          <div className="lg:col-span-7 space-y-8">
            <div className="bg-[#1a2d5a] rounded-2xl p-8 shadow-xl border border-[#fbbf24]/10">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <span className="text-[#fbbf24]">1.</span> {t('formTitle')}
              </h2>

              <FormSection
                baseUrl={baseUrl}
                campaignName={campaignName}
                onBaseUrlChange={setBaseUrl}
                onCampaignChange={setCampaignName}
                onGenerate={handleGenerate}
                isGenerating={isGenerating}
                canGenerate={canGenerate}
                error={error}
                t={t}
              />
            </div>

            <div className="bg-[#1a2d5a] rounded-2xl p-8 shadow-xl border border-[#fbbf24]/10">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <span className="text-[#fbbf24]">2.</span> {t('matrixTitle')}
              </h2>

              <MatrixSelector
                selectedPlatforms={selectedPlatforms}
                selectedMediums={selectedMediums}
                combinationsCount={combinationsCount}
                t={t}
              />
            </div>

            <div className="flex justify-center pt-2">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate || isGenerating}
                className="px-12 py-4 text-lg font-semibold rounded-xl bg-[#fbbf24] hover:bg-[#f59e0b] active:bg-[#d97706] text-[#0c1e3e] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-3 shadow-lg hover:shadow-xl"
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('generating')}
                  </>
                ) : (
                  t('generateLinks')
                )}
              </button>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-5 space-y-8">
            <div id="results-section" className="bg-[#1a2d5a] rounded-2xl p-8 shadow-xl border border-[#fbbf24]/10 min-h-[420px]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                  <span className="text-[#fbbf24]">3.</span> {t('resultsTitle')}
                </h2>

                {currentResults.length > 0 && (
                  <button
                    onClick={handleCopyAllShorts}
                    className="text-sm px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition flex items-center gap-2"
                  >
                    📋 {t('copyAll')}
                  </button>
                )}
              </div>

              <ResultsTable
                results={currentResults}
                onCopy={handleCopy}
                copySuccess={copySuccess}
                t={t}
              />
            </div>

            <div className="bg-[#1a2d5a] rounded-2xl p-8 shadow-xl border border-[#fbbf24]/10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-semibold flex items-center gap-3">
                  {t('historyTitle')}
                </h2>
                {filteredHistory.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-sm text-red-400 hover:text-red-300 transition"
                  >
                    {t('clearHistory')}
                  </button>
                )}
              </div>

              <HistoryPanel
                history={filteredHistory}
                onLoadHistory={(item) => {
                  useAppStore.getState().loadFromHistory(item);
                  handleLoadHistory(item);
                }}
                t={t}
              />
            </div>
          </div>
        </div>

        <div className="mt-12 text-center text-sm text-[#64748b]">
          {t('expiresIn')} {t('week')}. Дані зберігаються тільки у вашому браузері.
          <br />
          TinyURL API ключ можна додати в <button onClick={openSettings} className="underline hover:text-[#fbbf24]">Налаштуваннях</button>.
        </div>
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={closeSettings}
        t={t}
      />

      {copySuccess && (
        <div className="fixed bottom-6 right-6 bg-[#fbbf24] text-[#0c1e3e] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-2 z-50">
          ✅ {copySuccess}
        </div>
      )}
    </div>
  );
}